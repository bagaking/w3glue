const assert = require('assert')
const ethrlp = require('../src/util/encoding/ethrlp')
const rlp = require('../src/util/encoding/rlp')
const should = require('should');
const BN = require('bn.js')

describe('invalid rlps', ()=> {
    it('should not crash on an invalid rlp', ()=> {
        let a = Buffer.from([239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 239, 191, 189, 29, 239, 191, 189, 77, 239, 191, 189, 239, 191, 189, 239, 191, 189, 93, 122, 239, 191, 189, 239, 191, 189, 239, 191, 189, 103, 239, 191, 189, 239, 191, 189, 239, 191, 189, 26, 239, 191, 189, 18, 69, 27, 239, 191, 189, 239, 191, 189, 116, 19, 239, 191, 189, 239, 191, 189, 66, 239, 191, 189, 64, 212, 147, 71, 239, 191, 189, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 239, 191, 189, 11, 222, 155, 122, 54, 42, 194, 169, 239, 191, 189, 70, 239, 191, 189, 72, 239, 191, 189, 239, 191, 189, 54, 53, 239, 191, 189, 100, 73, 239, 191, 189, 55, 239, 191, 189, 239, 191, 189, 59, 1, 239, 191, 189, 109, 239, 191, 189, 239, 191, 189, 93, 239, 191, 189, 208, 128, 239, 191, 189, 239, 191, 189, 0, 239, 191, 189, 239, 191, 189, 239, 191, 189, 15, 66, 64, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 4, 239, 191, 189, 79, 103, 239, 191, 189, 85, 239, 191, 189, 239, 191, 189, 239, 191, 189, 74, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 54, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 83, 239, 191, 189, 14, 239, 191, 189, 239, 191, 189, 239, 191, 189, 4, 63, 239, 191, 189, 63, 239, 191, 189, 41, 239, 191, 189, 239, 191, 189, 239, 191, 189, 67, 28, 239, 191, 189, 239, 191, 189, 11, 239, 191, 189, 31, 239, 191, 189, 239, 191, 189, 104, 96, 100, 239, 191, 189, 239, 191, 189, 12, 239, 191, 189, 239, 191, 189, 206, 152, 239, 191, 189, 239, 191, 189, 31, 112, 111, 239, 191, 189, 239, 191, 189, 65, 239, 191, 189, 41, 239, 191, 189, 239, 191, 189, 53, 84, 11, 239, 191, 189, 239, 191, 189, 12, 102, 24, 12, 42, 105, 109, 239, 191, 189, 58, 239, 191, 189, 4, 239, 191, 189, 104, 82, 9, 239, 191, 189, 6, 66, 91, 43, 38, 102, 117, 239, 191, 189, 105, 239, 191, 189, 239, 191, 189, 239, 191, 189, 89, 127, 239, 191, 189, 114])
        try {
            //console.log(a.toString('hex'), a.length)
            ethrlp.decode(a)
        } catch (e) {
            // FIXME: check for exception name
            // console.log(e)
            assert(true)
        }
    })
})

describe('ethrlp encoding (string):', ()=> {
    it('should return itself if single byte and less than 0x7f:', ()=> {
        let e = ethrlp.encode('a')
        rlp.decLen(e).should.equal(1)
        // console.log(e, e.toString())
        e.toString().should.equal('a')

    })

    it('length of string 0-55 should return (0x80+len(data)) plus data', ()=> {
        let e = ethrlp.encode('dog')
        e.length.should.equal(4)
        rlp.decLen(e).should.equal(4)
        e[0].should.equal(131)
        e[1].should.equal(100)
        e[2].should.equal(111)
        e[3].should.equal(103)
    })

    it('length of string >55 should return 0xb7+len(len(data)) plus len(data) plus data', ()=> {
        let e = ethrlp.encode('zoo255zoo255zzzzzzzzzzzzssssssssssssssssssssssssssssssssssssssssssssss')
        console.log('e',e)
        e.length.should.equal(72)

        e[0].should.equal(184)
        e[1].should.equal(70)
        e[2].should.equal(122)
        e[3].should.equal(111)
        e[12].should.equal(53)

        //rlp.decLen(e).should.equal(2)
    })
})

describe('ethrlp encoding (list):', ()=> {

    it('empty list should return [0xc0]', () => {
        e = ethrlp.encode([])
        e.should.deepEqual(Buffer.from([0xc0]))
    })

    it('length of list 0-55 should return (0xc0+len(data)) plus data', ()=> {
        let e = ethrlp.encode(['dog', 'god', 'cat'])
        e.length.should.equal(13)
        e[0].should.equal(204)
        e[1].should.equal(131)
        e[11].should.equal(97)
        e[12].should.equal(116)
    })

    it('length of list >55 should return 0xf7+len(len(data)) plus len(data) plus data', ()=> {
      // FIXME: need a test case here!
    })
})

describe('ethrlp encoding (integer):', ()=> {
    it('length of int = 1, less than 0x7f, similar to string', ()=> {
        let e = ethrlp.encode(15)
        e.length.should.equal(1)
        e[0].should.equal(15)
    })

    it('length of int > 55, similar to string', ()=> {
        let e = ethrlp.encode(1024)
        e.length.should.equal(3)
        e[0].should.equal(130)
        e[1].should.equal(4)
        e[2].should.equal(0)
    })

    it('it should handle zero', ()=> {
        ethrlp.encode(0).toString('hex').should.equal('80')
    })
})

describe('ethrlp decoding (string):', ()=> {
    it('first byte < 0x7f, return byte itself', ()=> {
        let d = ethrlp.decode(Buffer.from([97]))
        d.length.should.equal(1)
        d.toString().should.equal('a')
    })

    it('first byte < 0xb7, data is everything except first byte', ()=> {
        let d = ethrlp.decode(Buffer.from([131, 100, 111, 103]))
        d.length.should.equal(3)
        d.toString().should.equal('dog')
    })

    it('array', ()=> {
        let d = ethrlp.decode(Buffer.from([204, 131, 100, 111, 103, 131, 103, 111, 100, 131, 99, 97, 116]))
        console.log(d)
        d.should.deepEqual([Buffer.from('dog'), Buffer.from('god'), Buffer.from('cat')])
    })
})

describe('ethrlp decoding (int):', ()=> {
    it('first byte < 0x7f, return itself', ()=> {
        let d = ethrlp.decode(Buffer.from([15]))
        d.length.should.equal(1)
        d[0].should.equal(15)
    })

    it('first byte < 0xb7, data is everything except first byte', ()=> {
        let d = ethrlp.decode(Buffer.from([130, 4, 0]))
        d.length.should.equal(2)
        d.toString('hex').should.equal('0400')
    })
})

describe('strings over 55 bytes long', ()=> {
    let testString = 'This function takes in a data, convert it to buffer if not, and a length for recursion'
    let e = null
    it('should encode it', ()=> {
        e = ethrlp.encode(testString)
        e[0].should.equal(184)
        e[1].should.equal(86)
    })

    it('should decode', ()=> {
        let d = ethrlp.decode(e)
        d.toString().should.equal(testString)
    })
})

describe('list over 55 bytes long', ()=> {
    let testString = ['This', 'function', 'takes', 'in', 'a', 'data', 'convert', 'it', 'to', 'buffer', 'if', 'not', 'and', 'a', 'length', 'for', 'recursion', 'a1', 'a2', 'a3', 'ia4', 'a5', 'a6', 'a7', 'a8', 'ba9']
    let e = null

    it('should encode it', ()=> {
        e = ethrlp.encode(testString)
    })

    it('should decode', ()=> {
        let d = ethrlp.decode(e)
        for (let i = 0; i < d.length; i++) {
            d[i] = d[i].toString()
        }
        d.should.deepEqual( testString)
    })
})

describe('nested lists:', () => {
    let nestedList = [
        [],
        [[]],
        [[], [[]]]
    ]

    let e
    it('encode a nested list', () => {
        e = ethrlp.encode(nestedList)
        e.should.deepEqual(Buffer.from([0xc7, 0xc0, 0xc1, 0xc0, 0xc3, 0xc0, 0xc1, 0xc0]))
    })
    it('should decode a nested list', () => {
        let d = ethrlp.decode(e)
        nestedList.should.deepEqual(d)
    })

    let valueList = [
        [1, 2, 3], [
            Buffer.from([4, 5, 6]),
            Buffer.from([7, 8, 9]),
            [Buffer.from([0]), Buffer.from('abcd', 'hex')]
        ]
    ]
    it('should encode a list with values', () => {
        e = ethrlp.encode(valueList)
        e.should.deepEqual(Buffer.from([0xd2, 0xc3, 0x01, 0x02, 0x03, 0xcd, 0x83, 0x04, 0x05, 0x06, 0x83, 0x07, 0x08, 0x09, 0xc4, 0x00, 0x82, 0xab, 0xcd]))
    })
})
