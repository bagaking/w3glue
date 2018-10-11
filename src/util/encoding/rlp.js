'use strict'

/**
 * @fileOverview
 *
 * RLP Encoding
 *
 * @see {@link https://github.com/ethereum/wiki/wiki/RLP}
 *
 * formation:
 *
 * | type                       | head                          | payload               | memo                              |
 * | ----                       | --------                      | -------               | ----                              |
 * | single char [0, 0x7f]      | <empty>                       | [0, 0x7f]             |                                   |
 * | string (length < 56)       | [0x80, 0xb7] (56)             | string                |                                   |
 * | string (length >= 56)      | [0xb7, 0xbf] (8) .. length    | string                | max length can be 16 ** 8 == 4T   |
 * | array (length < 56)        | [0xc0, 0xf7] (56)             | string                |                                   |
 * | array (length >= 56)       | [0xf7, 0xff] (8) .. length    | string                | max length can be 16 ** 8 == 4T   |
 *
 */

const _ = require("lodash")
const {Buffer} = require('safe-buffer')
const {numOrStrToEvenHex} = require('./hex')

/**
 * encode a item that is 'A string (ie. byte array)'
 * @param {Buffer|Uint8Array|string} buf
 * @private
 */
function _encodeBuf(buf) {
    buf = Buffer.from(buf)
    return buf.length === 1 && buf[0] < 128 ? input : _appendHead(0x80, buf)
}

/**
 * encode a item that is 'A list of items'
 * @param {Array} arr
 * @private
 */
function _encodeArr(arr) {
    return _appendHead(0xc0, Buffer.concat(_.map(arr, _encodeBuf)))
}

/**
 * append the control word of the buffer
 *
 * @desc
 *
 * a control word should follow rules of:
 *
 * | type                       | head
 * | ----                       | --------
 * | single char [0, 0x7f]      | <empty>
 * | string (length < 56)       | [0x80, 0xb7] (56)
 * | string (length >= 56)      | [0xb7, 0xbf] (8) .. length
 * | array (length < 56)        | [0xc0, 0xf7] (56)
 * | array (length >= 56)       | [0xf7, 0xff] (8) .. length
 *
 * @param {Buffer} buf
 * @param {number} typeOffset - for array it is 0xc0(192), and for raw string it is 0x80(128)
 * @return {Buffer}
 */
function _appendHead(typeOffset, buf) {
    let lenBuf = buf.length
    if (lenBuf < 56) {
        // Concat with Buffer is about two times fast than Uint8Array
        return Buffer.concat([Buffer.from([typeOffset + lenBuf]), buf])
    } else if (lenBuf < Number.MAX_SAFE_INTEGER) {
        // there are up to 8 Byte using to present the length, thus the max length of data is 2 ** (8 * 8)
        // but in js, the largest accurate number is Number.MAX_SAFE_INTEGER
        let hexStrForLen = numOrStrToEvenHex(lenBuf)
        let head = numOrStrToEvenHex(typeOffset + 55 + (hexStrForLen.length / 2))
        // pay attention to the 'hex', when decode using buf.toString('hex')
        // when input < 256, its equal to Buffer.from([input]), but it shouldn't happen, that's why we use this api
        return Buffer.concat([Buffer.from(head + hexStrForLen, 'hex'), buf])
    } else {
        throw new Error(`content size ${lenBuf} exceeded`)
    }
}

/**
 * encode an item
 * @param {Array|Buffer|Uint8Array|string} item
 * @return {Buffer}
 */
function encode(item) {
    if (_.isArray(item)) {
        return _encodeArr(item)
    } else if (_.isBuffer(item) || _.isString(item) || item instanceof Uint8Array) {
        return _encodeBuf(item)
    } else {
        throw new Error("type error: item must be a string (ie. byte array)")
    }
}

/**
 * decode <arrItems>
 * @desc arr buffer : (<cw>[lenOfLen]<len><arrItems>)
 * @param {Buffer} buf - is considered buffered <arrItems>
 */
function _decodeArr(buf) {
    if (!_.isBuffer(buf)) {
        throw new Error("type error: the input of decode must be a buffer")
    }

    let cur = 0

    /**
     * @param {number} len
     * @return {Buffer} seg
     */
    const take = len => {
        let ret = buf.slice(cur, cur += len)
        if (cur >= buf.length) throw new Error('decode error: out of range when slice');
        return ret
    }

    /**
     * @param {Buffer} buf
     * @return {number} len
     */
    const buf2len = buf => {
        let hexLen = buf.toString('hex')
        if (hexLen.startsWith('00')) throw new Error('invalid RLP: extra zeros');
        return parseInt(hexLen, 16)
    }

    /**
     * @param {number} cw - first number of buffer
     * @return {number} len
     */
    const cw2len = cw => {
        let len = cw % 64
        return len < 56 ? len : buf2len(take(len * 2)) // or !!((len ^ 56) >> 3) :LOL
    }

    // In this implementation, the input 'buf' is considered <arrItems>
    // Therefore, the return value must be a arr
    let result = []

    while (cur < buf.length) {
        let cw = buf[cur++]
        if (cw < 0x80) { // 0 ~ 0x7f = 128
            result.push(cw);
        } else if (cw < 0xc0) { // buf item, 0x7f ~ 0xb7 = 56, 0xb8 ~ 0xbf = 8
            result.push(take(cw2len(cw)))
        } else { // arr item, 0xc0 ~ 0xf7 = 56, 0xf7 ~ 0xff = 8
            result.push(decode(take(cw2len(cw))))
        }
    }

    return result
}

/**
 * decode an buffer
 * @param {Buffer} buf - encoded buffer
 */
function decode(buf) {
    // only the first element is legal
    let results = _decodeArr(buf)

    if(results.length > 1){
        throw new Error("rlp : only single item is enabled")
    }

    return results[0]
}

module.exports = {
    encode,
    decode
}