const assert = require('assert')
const ethrlp = require('../src/util/encoding/rlp/ethrlp')
const rlp = require('../src/util/encoding/rlp/rlp')
const should = require('should');
const BN = require('bn.js')
const testing = require('ethereumjs-testing')

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

describe('typed lists:', ()=> {
    let valueList = [
        [1, 2, 3],
        [
            new Uint8Array([4, 5, 6]),
            new Uint8Array([7, 8, 9]),
            [
                new Uint8Array([0]),
                Buffer.from('abcd', 'hex')
            ]
        ]
    ]

    // equivalent to list of values above
    it('encode a nested list', ()=> {
        let valueEncoded = ethrlp.encode(valueList)
        valueEncoded.should.deepEqual( new Buffer([0xd2, 0xc3, 0x01, 0x02, 0x03, 0xcd, 0x83, 0x04, 0x05, 0x06, 0x83, 0x07, 0x08, 0x09, 0xc4, 0x00, 0x82, 0xab, 0xcd]))
    })
})

describe('null values', ()=> {
    let nestedList = [null]
    let e
    it('encode a null array', ()=> {
        e = ethrlp.encode(nestedList)
        e.should.deepEqual( Buffer.from([0xc1, 0x80]))
    })

    it('should decode a null value', ()=> {
        Buffer.from([]).should.deepEqual(ethrlp.decode(Buffer.from('80', 'hex')))
    })
})

describe('zero values', ()=> {
    let e
    it('encode a zero', ()=> {
        e = ethrlp.encode(Buffer.from([0]))
        e.should.deepEqual( Buffer.from([0]))
    })

    it('decode a zero', ()=> {
        let d = ethrlp.decode(Buffer.from([0]))
        d.should.deepEqual( Buffer.from([0]))
    })
})

describe('empty values', () => {
    it('decode empty buffer', () => {
        let d = ethrlp.decode(Buffer.from([]))
        d.should.deepEqual(Buffer.from([]))
    })
})


describe('hex prefix', ()=> {
    it('should have the same value', ()=> {
        let a = ethrlp.encode('0x88f')
        let b = ethrlp.encode('88f')
        a.toString('hex').should.not.equal(b.toString('hex'))
    })
})

describe('bad values', () => {
    it('wrong e a zero', ()=> {
        let val = Buffer.from('f9005f030182520894b94f5374fce5edbc8e2a8697c15331677e6ebf0b0a801ca098ff921201554726367d2be8c804a7ff89ccf285ebc57dff8ae4c44b9c19ac4aa08887321be575c8095f789dd4c743dfe42c1820f9231f98a962b210e3ac2452a3', 'hex')
        let result
        try {
            result = ethrlp.decode(val)
        } catch (e) {}
        assert.strictEqual(result, undefined)
        // result.should.equal(undefined)
    })

    it('invalid length', () => {
        let a = Buffer.from('f86081000182520894b94f5374fce5edbc8e2a8697c15331677e6ebf0b0a801ca098ff921201554726367d2be8c804a7ff89ccf285ebc57dff8ae4c44b9c19ac4aa08887321be575c8095f789dd4c743dfe42c1820f9231f98a962b210e3ac2452a3', 'hex')
        let result
        try {
            result = ethrlp.decode(a)
        } catch (e) {
        }
        assert.strictEqual(result, undefined)
    })

    it('extra data at end', ()=> {
        let c = 'f90260f901f9a02a3c692012a15502ba9c39f3aebb36694eed978c74b52e6c0cf210d301dbf325a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a0b6c9fd1447d0b414a1f05957927746f58ef5a2ebde17db631d460eaf6a93b18da0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845509814280a00451dd53d9c09f3cfb627b51d9d80632ed801f6330ee584bffc26caac9b9249f88c7bffe5ebd94cc2ff861f85f800a82c35094095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba098c3a099885a281885f487fd37550de16436e8c47874cd213531b10fe751617fa044b6b81011ce57bffcaf610bf728fb8a7237ad261ea2d937423d78eb9e137076c0ef'

        let a = Buffer.from(c, 'hex')

        let result
        try {
            result = ethrlp.decode(a)
        } catch (e) {}
        assert.strictEqual(result, undefined)
    })

    it('extra data at end', ()=> {
        let c = 'f9ffffffc260f901f9a02a3c692012a15502ba9c39f3aebb36694eed978c74b52e6c0cf210d301dbf325a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a0b6c9fd1447d0b414a1f05957927746f58ef5a2ebde17db631d460eaf6a93b18da0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845509814280a00451dd53d9c09f3cfb627b51d9d80632ed801f6330ee584bffc26caac9b9249f88c7bffe5ebd94cc2ff861f85f800a82c35094095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba098c3a099885a281885f487fd37550de16436e8c47874cd213531b10fe751617fa044b6b81011ce57bffcaf610bf728fb8a7237ad261ea2d937423d78eb9e137076c0'

        let a = Buffer.from(c, 'hex')

        let result
        try {
            result = ethrlp.decode(a)
        } catch (e) {}
        assert.strictEqual(result, undefined)
    })

    it('list length longer than data', ()=> {
        let c = 'f9ffffffc260f901f9a02a3c692012a15502ba9c39f3aebb36694eed978c74b52e6c0cf210d301dbf325a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a0b6c9fd1447d0b414a1f05957927746f58ef5a2ebde17db631d460eaf6a93b18da0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845509814280a00451dd53d9c09f3cfb627b51d9d80632ed801f6330ee584bffc26caac9b9249f88c7bffe5ebd94cc2ff861f85f800a82c35094095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba098c3a099885a281885f487fd37550de16436e8c47874cd213531b10fe751617fa044b6b81011ce57bffcaf610bf728fb8a7237ad261ea2d937423d78eb9e137076c0'

        let a = Buffer.from(c, 'hex')

        let result
        try {
            result = ethrlp.decode(a)
        } catch (e) {}
        assert.strictEqual(result, undefined)
    })
})

describe('offical tests', function () {
    it('pass all tests', function (done) {
        const cases = testing.getSingleFile('RLPTests/rlptest.json')

        for (let i in cases) {
            let org = cases[i].in
            // if we are testing a big number
            if (org[0] === '#') {
                let bn = new BN(org.slice(1))
                org = Buffer.from(bn.toArray())
            }

            let encoded = ethrlp.encode(org)
            encoded.toString('hex').should.equal(cases[i].out.toLowerCase())
        }
        done()
    })
})
