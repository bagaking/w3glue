'use strict'

const _ = require("lodash")
const {Buffer} = require('buffer')
const log = require("./log")
const Web3 = require("web3")

const MAX_LENGTH = 16 ** 8
const MAX_IN_PLACE_LENGTH_NUM = 55

/**
 * RLP Encoding
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

/**
 * find out if the string's length is a even number
 * @param {string} str
 * @return {string}
 */
function padToEven(str) {
    return !(str.length & 1) ? str : "0" + str;
}

/**
 * pad to even hex string
 * @param {string|number} v
 * @return {string}
 */
function numToEvenHex(v) {
    let str = _.isNumber(v) ? v.toString(16) : v
    return padToEven(str);
}

function strToEvenHex(str) {
    let hex = ""
    for (let i in str) {
        hex += padToEven(str.charCodeAt(i).toString(16))
    }
    return hex
};

/**
 * the converter between raw input and encode procedure
 * @param v
 * @return {string}
 */
function parseItem(v) {
    return padToEven(Web3.utils.toHex(v).slice(2).replace(/^0+$/, '')) // this method supports bigNumber

    // let ret = ''
    // if (typeof v === 'string') {
    //     if (isRlpEncodedStr(v)) {
    //         ret = padToEven(v.slice(2))
    //     } else {
    //         ret = strToEvenHex(v)
    //     }
    // } else if (typeof v === 'number') {
    //     if(v >= Number.MAX_SAFE_INTEGER) throw new Error(`number ${v} exceeded Number.MAX_SAFE_INTEGER ${Number.MAX_SAFE_INTEGER}, using string instead `)
    //     ret = v === 0 ? "" : numToEvenHex(v) // special parse operation when str equals to "0"  (number 0,  boolean 'false')
    // } else if (typeof v === 'boolean') {
    //     ret = parseItem(v ? 1 : 0)
    // } else if (v === null || v === undefined) {
    //     ret = v
    // } else { // todo: more data type should be supported, such as bigInt, ByteArray(num), Object etc.
    //     throw new Error('invalid type')
    // }
    // return ret
}

/**
 * find out if the string match the rlp format
 * @param {string} str
 * @return {boolean}
 */
function isRlpEncodedStr(str) {
    return _.isString(str) && str.startsWith("0x") //todo: pay attention to this '0x', it means the string is already encoded
}

/**
 * get the control word of the hexStr by it's data length and type
 *
 * @desc
 *
 * a control word should follow the rules at
 * {@link https://github.com/ethereum/wiki/wiki/RLP}
 *
 * | type                       | head
 * | ----                       | --------
 * | single char [0, 0x7f]      | <empty>
 * | string (length < 56)       | [0x80, 0xb7] (56)
 * | string (length >= 56)      | [0xb7, 0xbf] (8) .. length
 * | array (length < 56)        | [0xc0, 0xf7] (56)
 * | array (length >= 56)       | [0xf7, 0xff] (8) .. length
 *
 * @param dataLength - data length should be half hexStr length
 * @param typeOffset - for array it is 0xc0(192), and for raw string it is 0x80(128)
 * @return {string}
 */
function encodeLength(dataLength, typeOffset) {
    if (dataLength <= MAX_IN_PLACE_LENGTH_NUM) {
        log.verbose("0.", typeOffset, dataLength)
        return numToEvenHex(typeOffset + dataLength)
    } else if (dataLength < MAX_LENGTH) {
        let hexLength = numToEvenHex(dataLength)
        log.verbose("1.", typeOffset, dataLength, hexLength)
        let controlWord = numToEvenHex(typeOffset + MAX_IN_PLACE_LENGTH_NUM + (hexLength.length / 2))
        return controlWord + hexLength
    } else {
        throw new Error(`content size ${dataLength} exceeded`)
    }
}

function compile(node) {
    let result = null
    if (node instanceof Array) {
        let hexNode = _.join(_.map(node, compile), '')
        let cWord = encodeLength(hexNode.length / 2, 0xc0)
        result = cWord + hexNode
        log.verbose("array", "node:", node, "cWord:", cWord, "hexNode:", hexNode, "result:", result)
    } else {
        let leaf = parseItem(node)
        if (leaf.length === 2 && leaf < "80") {
            log.verbose("leaf < 0x80", "node:", node, typeof node, "leaf:", leaf, typeof leaf)
            result = leaf
        } else {
            log.verbose("leaf > 0x80", "node:", node, typeof node, "leaf:", leaf, typeof leaf)
            result = encodeLength(leaf.length / 2 | 0, 0x80) + leaf
        }
    }
    return result
}

function encode(node) {
    return `0x${compile(node)}`
}


function decode(hexStr) {
    if (!isRlpEncodedStr(hexStr)) {
        throw new Error("rlp decode error: the input string is not the rlp format.")
    }
}



module.exports = {
    numToEvenHex,
    isRlpEncodedStr,
    encodeLength,
    compile,
    encode,
    decode
};
