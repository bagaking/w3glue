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
const log = require("../log")

/**
 * encode a item that is 'A string (ie. byte array)'
 * @param {Buffer} buf
 * @private
 */
function _encodeBuf(buf) {
    buf = Buffer.from(buf)
    return buf.length === 1 && buf[0] < 128 ? buf : _appendHead(0x80, buf)
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

//
function _defaultFnPretend(item) {
    if (_.isBuffer(item) || _.isString(item) || item instanceof Uint8Array) {
        return Buffer.from(item)
    }
    throw new Error('rle._defaultFnPretend : invalid type')
}

/**
 * encode an item
 * @param {*} item - with default fnPretendItem, item should be a Buffer|Uint8Array|string
 * @param {function(*) : Buffer} fnPretendItem
 * @return {Buffer}
 */
function encode(item, fnPretendItem = _defaultFnPretend) {
    if (_.isArray(item)) {
        return _encodeArr(item)
    } else if (_.isFunction(fnPretendItem)) {
        return _encodeBuf(fnPretendItem(item))
    } else {
        throw new Error("type error: item is not available (ie. byte array)")
    }
}

/**
 * the get length method of
 * @param buf
 * @param fnPretendItem
 * @return {number} total length :
 */
function decLen(buf, fnPretendItem = _defaultFnPretend) {
    if (!fnPretendItem) throw new Error('decode error: fnPretendItem must exist');
    buf = fnPretendItem(buf)
    let cw = buf[0]
    if (cw < 0x80) { // 0 ~ 0x7f = 128
        return 1
    } else {
        let len = cw % 64
        if (len < 0) throw new Error('decode error: empty input');
        let end = 1 + len * 2
        if (len >= buf.length) throw new Error('decode error: out of range');
        log.verbose(buf, cw, len, end)
        return 1 + len + (len < 56 ? 0 : _buf2len(buf.slice(1, end)))
    }
}

/**
 * @param {Buffer} buf
 * @return {number} len
 */
function buf2Len(buf) {
    let hexLen = buf.toString('hex')
    if (hexLen.startsWith('00')) throw new Error('invalid RLP: extra zeros');
    return parseInt(hexLen, 16)
}

/**
 * decode <arrItems>
 * @desc arr buffer : (<cw>[lenOfLen]<len><arrItems>)
 * @param {Buffer} buf - is considered buffered <arrItems>
 */
function _decodeArr(buf) {
    log.verbose(`decode: ${buf.toString('hex')}`)
    if (!_.isBuffer(buf)) {
        throw new Error("type error: the input of decode must be a buffer")
    }

    let cur = 0

    /**
     * @param {number} len
     * @return {Buffer} seg
     */
    const _take = len => {
        let ret = buf.slice(cur, cur += len)
        if (cur >= buf.length) {
            log.err(`decode error: ${cur} out of range when slice ${buf.toString('hex')}(${buf.length})`)
            throw new Error('decode error: out of range when slice');
        }
        return ret
    }

    /**
     * @param {number} cw - first number of buffer
     * @return {number} len
     */
    const _cw2len = cw => {
        let len = cw % 64
        return len < 56 ? len : buf2Len(_take(len * 2)) // or !!((len ^ 56) >> 3) :LOL
    }

    // In this implementation, the input 'buf' is considered <arrItems>
    // Therefore, the return value must be a arr
    let result = []

    while (cur < buf.length) {
        let cw = buf[cur++]
        if (cw < 0x80) { // 0 ~ 0x7f = 128
            result.push(cw);
        } else {
            let len = _cw2len(cw)
            let seg = _take(len)
            log.verbose("d:", cw.toString(16), len)
            // buf item: 0x7f ~ 0xb7 = 56, 0xb8 ~ 0xbf = 8
            // arr item, 0xc0 ~ 0xf7 = 56, 0xf7 ~ 0xff = 8
            result.push(cw < 0xc0 ? seg : decode(seg))
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

    if (results.length > 1) {
        throw new Error("rlp : only single item is enabled")
    }

    return results[0]
}

module.exports = {
    decLen,
    buf2Len,
    encode,
    decode
}