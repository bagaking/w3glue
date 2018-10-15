'use strict'

const _ = require('lodash')


const padToEven = (str, fillStr = '0') => str.length % 2 ? fillStr + str : str;

/**
 * pad to even hex string
 * @param {string|number} v
 * @return {string}
 */
const numOrStrToEvenHex = v => padToEven(v.toString(16));

const isPrefixedHexStr = hex => _.isString(hex) && /^(-)?0x[0-9a-f]*$/i.test(hex);

const isHexStr = hex => _.isString(hex) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex);

const utf8StrToHex = utf8Str => // before encoding, 0 at start or end should be removed
    _.map(utf8Str.replace(/^(?:\u0000)*/g, '').replace(/(?:\u0000)*$/g, ''),
        (s, i, o) => numOrStrToEvenHex(o.charCodeAt(i)))


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


