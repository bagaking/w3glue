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
 * decode an buffer
 * @param {Buffer} buf - encoded buffer
 */
function decode(buf, outExtra) {
    if (!_.isBuffer(buf)) {
        throw new Error("type error: the input of decode must be a buffer")
    }

    let cur = 0
    let result = []

    const slice = len => {
        let ret = buf.slice(cur, cur += len)
        if(cur >= buf.length) throw new Error('decode error: out of range when slice')
        return ret
    }

    const length = cw => {
        let len = cw % 64
        return len < 56 ? len : slice(len)
    }

    while (cur < buf.length) {
        let cw = buf[cur++]
        if (cw < 0x80) { // 0 ~ 0x7f = 128
            result.push(cw);
        } else if (cw < 0xc0) { // 0x7f ~ 0xb7 = 56, 0xb8 ~ 0xbf = 8
            result.push(slice(length(cw)))
        } else { // 0xc0 ~ 0xf7 = 56, 0xf7 ~ 0xff = 8
            //todo: parse arr
        }
    }

    return result
}

module.exports = {
    encode,
    decode
}