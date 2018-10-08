const should = require('should');
const {Mux, util} = require('../src/glue')
const Path = require('path')
const fs = require('fs')

let mux = null

let accounts = ["0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E", "0x7D86165b5065f7C4A6B8E3b9d74fa736B32246F2"]

describe('../main.js', async function () {
    let mux = new Mux("main", "http://127.0.0.1:7545")
    beforeEach(async () => {

    })

    it('getBlockNumber', async function () {
        let blockNumber = await mux.getBlockNumber()
        blockNumber.should.greaterThan(6)
        util.log.success("blockNumber", blockNumber)
    })

    it('sendTransaction', async function () {
        let trans = await mux.sendTransaction(accounts[0], accounts[1], 1)


        let trans2 = await mux.getTransactionReceipt(trans.transactionHash)
        trans.transactionHash.should.equal(trans2.transactionHash)

        util.log.success("sendTransaction / getTransactionReceipt", accounts, JSON.stringify(trans))
    })

    let c1 = null
    let c2 = null
    it('deploy', async function () {
        let boxData = JSON.parse(fs.readFileSync(Path.join(__dirname, "contracts/Leblock.json"), 'utf8'))
        await mux.deployContract("c1", accounts[0], ["c1", "lb 1", "100000000"], boxData)
        c1 = mux.getContract("c1")
        await mux.deployContract("c2", accounts[0], ["c1", "lb 2", "100000000"], boxData)
        c2 = mux.getContract("c2")

        util.log.success("c1", c1.address)
        util.log.success("c2", c2.address)
    })

    let trans = null
    it('erc20 transfer', async function () {
        let b0 = await c1.callAsync("balanceOf", accounts[0])
        b0.should.equal('100000000000000000000000000')

        let b1 = await c1.callAsync("balanceOf", accounts[1])
        b1.should.equal('0')

        trans = await c1.getMethod("transfer", accounts[1], '10000').send({from: accounts[0]})

        let bb0 = await c1.callAsync("balanceOf", accounts[0])
        let bb1 = await c1.callAsync("balanceOf", accounts[1])
        bb1.should.equal('10000')

        util.log.success("balances", b0,b1,bb0,bb1, JSON.stringify(trans))

        let newTrans = await mux.getTransactionReceipt(trans.transactionHash)
        util.log.success("getTransactionReceipt", JSON.stringify(trans.events, null, 4))

    })


})
