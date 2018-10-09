const _ = require("lodash")

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
 * @return {boolean}
 */
function isEvenStr(str) {
    return !!(str.length & 1)
}

/**
 * pad to even hex string
 * @param {string|number} v
 * @return {string}
 */
function toEvenHex(v) {
    let str = _.isNumber(v) ? v.toString(16) : v
    return isEvenStr(str) ? str : "0" + str;
}

/**
 * find out if the string match the rlp format
 * @param {string} str
 * @return {boolean}
 */
function isRlpEncodedStr(str) {
    return _.isString(str) && str.startsWith("0x") && isEvenStr(str) //todo: pay attention to this '0x', it means the string is already encoded
}

/**
 * get the control word of the hexStr by it's data length and type
 *
 * @desc
 *
 * a control word should follow the rules at
 * [https://github.com/ethereum/wiki/wiki/RLP](https://github.com/ethereum/wiki/wiki/RLP)
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
function controlWord(dataLength, typeOffset) {
    if (dataLength <= MAX_IN_PLACE_LENGTH_NUM) {
        return toEvenHex(typeOffset + dataLength)
    } else if (dataLength < MAX_LENGTH) {
        return toEvenHex(typeOffset + MAX_IN_PLACE_LENGTH_NUM + (1 + Math.log(dataLength) | 0)) + toEvenHex(dataLength);
    } else {
        throw new Error("content size exceeded")
    }
}

function compile(node) {
    if (node instanceof Array) {
        let hexNode = _.join(_.map(node, compile), '')
        let cWord = controlWord(hexNode.length / 2, 0xc0)
        return cWord + hexNode
    } else {
        let hexLeaf = isRlpEncodedStr(node) ? node.slice(2) : toEvenHex(node)
        if (hexLeaf.length === 1 && hexLeaf.charCodeAt(0) < 0x80) {
            return hexLeaf
        } else {
            return controlWord(hexLeaf.length / 2, 0x80) + hexLeaf
        }
    }
}

function encode(node) {
    return `0x${compile(node)}`
}




module.exports = {
    toEvenHex,
    isRlpEncodedStr,
    encodeLength,
    compile,
    encode,
};