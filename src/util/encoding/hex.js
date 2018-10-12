'use strict'

const _ = require('lodash')

/**
 * pad to even hex string
 * @param {string|number} v
 * @return {string}
 */
const numOrStrToEvenHex = (v) => v.toString(16).padStart(2, '0');

const isPrefixedHexStr = hex => _.isString(hex) && /^(-)?0x[0-9a-f]*$/i.test(hex);

const isHexStr = hex => _.isString(hex) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex);

const utf8StrToHex = utf8Str => // before encoding, 0 at start or end should be removed
    _.map(utf8Str.replace(/^(?:\u0000)*/g, '').replace(/(?:\u0000)*$/g, ''),
        (s, i, o) => o.charCodeAt(i).toString(16).padStart(2))


function toHex(value) {
    let ret = ''

    if (_.isBoolean(value))
        return toHex(value ? 1 : 0);

    if (_.isNumber(value))
        return numOrStrToEvenHex(value);

    if (_.isString(value)) {
        if (isHexStr(value)) {
            throw new Error("implement me ! ")//todo
        } else {
            return numOrStrToEvenHex(value);
        }
    }

    if (_.isObject(value)) {
        return utf8StrToHex(JSON.stringify(value))
    }

    return ret
}

module.exports = {
    numOrStrToEvenHex,
    isPrefixedHexStr,
    isHexStr
}


