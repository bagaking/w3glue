let _ = require('lodash')
let rlp = require('./rlp')
let {isPrefixedHexStr, numOrStrToEvenHex} = require('./hex')

function _toBuffer(v) {
    if (_.isBuffer(v)) return v;

    if (v === null || v === undefined) return Buffer.from([]);

    if (_.isString(v)) return isPrefixedHexStr(v) ? Buffer.from(numOrStrToEvenHex(v.slice(2)), 'hex') : Buffer.from(v);

    if (_.isNumber(v)) return Buffer.from(v ? numOrStrToEvenHex(v) : [], 'hex')

    if (v instanceof Uint8Array) return Buffer.from(v);

    if (v.toArray) return Buffer.from(v.toArray()); // converts a BN to a Buffer

    throw new Error(`ethrlp._toBuffer invalid type ${v} of type ${typeof v}`)
}

/**
 * @param input
 * @return {Buffer}
 */
function encode(input) {
    return rlp.encode(input, _toBuffer)
}

/**
 * @param input
 * @return {Buffer}
 */
function decode(input) { console.log("ethrpc.decode", input, _toBuffer(input))
    return rlp.decode(_toBuffer(input))
    //todo: need implement
}

module.exports = {
    encode,
    decode
}