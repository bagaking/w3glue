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
        log.info("<56", typeOffset, buf, Buffer.concat([Buffer.from([typeOffset + lenBuf]), buf]).toString('hex'))
        // Concat with Buffer is about two times fast than Uint8Array
        return Buffer.concat([Buffer.from([typeOffset + lenBuf]), buf])
    } else if (lenBuf < Number.MAX_SAFE_INTEGER) {
        log.info(">=56", buf)
        // there are up to 8 Byte using to present the length, thus the max length of data is 2 ** (8 * 8)
        // but in js, the largest accurate number is Number.MAX_SAFE_INTEGER
        let hexStrForLen = numOrStrToEvenHex(lenBuf)
        let head = numOrStrToEvenHex(typeOffset + 55 + (hexStrForLen.length / 2)) // thus 56 ==> 1
        // pay attention to the 'hex', when decode using buf.toString('hex')
        // when input < 256, its equal to Buffer.from([input]), but it shouldn't happen, that's why we use this api
        log.info(head, hexStrForLen)
        return Buffer.concat([Buffer.from(head + hexStrForLen, 'hex'), buf])
    } else {
        throw new Error(`content size ${lenBuf} exceeded`)
    }
}

/**
 * Default method to convert item to buffer
 * @param item
 * @return {Buffer}
 * @private
 */
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
    if (!_.isFunction(fnPretendItem)) {
        fnPretendItem = _defaultFnPretend
    }

    const _encodeBuf = leaf => (leaf = fnPretendItem(leaf), leaf.length === 1 && leaf[0] < 128 ? leaf : _appendHead(0x80, leaf));

    const _encodeArr = arr => _appendHead(0xc0, Buffer.concat(_.map(arr, _encode)));

    const _encode = item => (_.isArray(item) ? _encodeArr : _encodeBuf)(item);

    let result = _encode(item)
    log.success("encode success", result.toString('hex'))
    return result
}

/**
 * convert buf to int, using 'length' scheme
 * @param {Buffer} buf
 * @return {number} len
 */
function buf2Len(buf) {
    let hexLen = buf.toString('hex')
    log.info(buf, hexLen)
    if (hexLen.startsWith('00')) throw new Error('invalid RLP: extra zeros');
    return parseInt(hexLen, 16)
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
        let end = 1 + (len - 55) // when dec, there no need to double char, cuz the 'hex'
        if (len >= buf.length) throw new Error('decode error: out of range');
        log.verbose(buf, cw, len, end, buf2Len(buf.slice(1, end)))
        return 1 + (len < 56 ? len : (len - 55) + buf2Len(buf.slice(1, end)))
    }
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
        if (cur > buf.length) {
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
        return len < 56 ? len : buf2Len(_take((len - 55))) // or !!((len ^ 56) >> 3) :LOL
    }

    // In this implementation, the input 'buf' is considered <arrItems>
    // Therefore, the return value must be a arr
    let result = []

    while (cur < buf.length) {
        let bufCw = _take(1)
        let cw = bufCw[0]
        if (cw < 0x80) { // 0 ~ 0x7f = 128
            result.push(bufCw);
            log.info("<0x80", cw);
        } else {
            let len = _cw2len(cw);
            let seg = _take(len)
            log.verbose(">=0x80", cw, len);
            // buf item: 0x7f ~ 0xb7 = 56, 0xb8 ~ 0xbf = 8
            // arr item, 0xc0 ~ 0xf7 = 56, 0xf7 ~ 0xff = 8
            result.push(cw < 0xc0 ? seg : _decodeArr(seg));
        }
        console.log("proc", cur, buf.length)
    }
    return result
}

/**
 * decode an buffer
 * @param {Buffer} buf - encoded buffer
 */
function decode(buf) {
    console.log("rlp.decode", buf)


    // only the first element is legal
    let results = _decodeArr(buf)

    log.success("decode success", decLen(buf), results);
    console.log(results)

    if (results.length > 1) {
        throw new Error(`rlp : only single item is enabled ${results}`)
    }

    if (results.length === 0) {
        return Buffer.from([])
    }

    return results[0]
}

module.exports = {
    decLen,
    buf2Len,
    encode,
    decode
}