/**
 * RLP Encoding
 *
 * formation:
 *
 * | type                       | head                  | payload               | memo                              |
 * | ----                       | --------              | -------               | ----                              |
 * | single char [0, 0x7f]      | <empty>               | [0, 0x7f]             |                                   |
 * | string (length < 56)       | [0x80, 0xb7] (56)     | string                |                                   |
 * | string (length >= 56)      | [0xb7, 0xbf] (8)      | length .. string      | max length can be 16 ** 8 == 4T   |
 * | array (length < 56)        | [0xc0, 0xf7] (56)     | string                |                                   |
 * | array (length >= 56)       | [0xf7, 0xff] (8)      | length .. string      | max length can be 16 ** 8 == 4T   |
 *
 */
class RLPEncoding{

}

const _ = require("lodash")

/**
 * pad to even hex string
 * @param {string|number} v
 * @return {string}
 */
function toEvenHex(v) {
    let str = _.isNumber(v) ? v.toString(16) : v
    return str.length & 1 ? str : "0" + str;
}

function encode(node) {
    if (node instanceof Array) {
        let hexNode = _.join(_.map(node, encode), '')
        let head = encodeLength(hexNode.length / 2, 0xc0)
        return head + hexNode
    } else {
        let leaf = _.isString(node) ? (node.startWith("0x") ? node.slice(2) : node) : _.toString(node) //todo: pay attention to this '0x'
        if (leaf.length === 1 && leaf.charCodeAt(0) < 0x80) {
            return leaf
        } else {
            return encodeLength(leaf.length, 0x80) + leaf
        }
    }
}

function encodeLength(length, offset) {
    if (length < 56) {
        return toEvenHex(length + offset)
    } else if(length < 16 ** 8) {
        return toEvenHex(offset + (Math.log(length) + 1 | 0) + 55) + toEvenHex(length);
    } else {
        throw new Error("content size exceeded")
    }
}
