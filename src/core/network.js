"using strict"

const Web3 = require('web3')     // document: https://web3js.readthedocs.io/en/1.0/index.html
const net = require('net')
const _ = require('lodash')

const Contract = require('./contract')

const __TYPE = {
    HTTP: Symbol("http"),
    WS: Symbol("ws"),
    IPC: Symbol("ipc")
}

function createProvider(type, host) {
    let web3Inst = new Web3()
    switch (type) {
        case __TYPE.HTTP:
            web3Inst.setProvider(new Web3.providers.HttpProvider(host))
            break;
        case __TYPE.WS:
            web3Inst.setProvider(new Web3.providers.WebsocketProvider(host))
            break;
        case __TYPE.IPC:
            web3Inst.setProvider(new Web3.providers.IpcProvider(host, net))
            break;
        default:
            throw new Error("type error")
    }
    return web3Inst
}

const symMyProvider = Symbol("provider")

const symMyPrev = Symbol("prev")


class Network {

    constructor(type, host) {
        if (!_.isString(host)) throw new Error("host error: host address is not exist")
        this[symMyProvider] = createProvider(type, host)
        this[symMyPrev] = null
        this._newNum = 0

        /** @type {{Object.<string:Contract>}} */
        this._contracts = {}
    }

    spawn(type, host) {
        let child = new Network(type, host)
        this._newNum++
        child[symMyPrev] = this
        return child
    }

    get provider() {
        return this[symMyProvider]
    }

    get eth() {
        return this.provider.eth
    }

    // muxMain.$WS.attachContract(tag, abi, address)
    attachContract(tag, address, {abi}) {
        this._contracts[tag] = Contract.create(this.provider, abi).attach(address);
        return this._contracts[tag]
    }

    async deployContract(tag, sender, args, {abi, bytecode}, extraGasLimit = 1) {
        let contract = await Contract.create(this.provider, abi)
        contract["extraGasLimit"] = extraGasLimit
        this._contracts[tag] = await contract.deploy(bytecode, sender, ...args);
        return this._contracts[tag]
    }

    /**
     * ensure and get a contract
     * @param tag
     * @return {Contract}
     */
    getContract(tag) {
        let result = this._contracts[tag]
        if (!result && !!this[symMyPrev]) {
            result = this[symMyPrev].getContract(tag)
            if (!!result) {
                result = this.attachContract(tag, result.address, {abi: result.abi})
            }
        }
        return result
    }

    // ========================================================== Region Methods : RPC

    /**
     * Create a new account
     * @param {string} pwd - the password of the new account
     * @returns rsp of ajax
     */
    async newAccount(pwd) {
        let p = this.eth.personal
        return await p.newAccount(pwd);
    }

    async unlockAccount(address, password, duration) {
        let p = this.eth.personal
        await p.unlockAccount(address, password, duration)
        return address
    };

    async sign(dataToSign, address, password) {
        let p = this.eth.personal
        return await p.sign(dataToSign, address, password)
    }


    // ========================================================== Region Methods : Transactions

    async getTransactionCount(address) {
        return await this.eth.getTransactionCount(address, 'pending');
    }

    async getTransactionSuccessCount(address) {
        return await this.eth.getTransactionCount(address);
    }

    async getAllPendingTransactionCount(address) {
        return await this.eth.getBlockTransactionCount("pending")
    }


    /**
     * get transaction info
     * @param txhash
     * @returns {Promise<void>}
     */
    async getTransaction(txhash) {
        return await this.eth.getTransaction(txhash)
    }

    async getTransactionReceipt(txhash) {
        return await this.eth.getTransactionReceipt(txhash)
    }

    // ========================================================== Region Methods : Provider


    async getPastLogs(address, fromBlock, toBlock, topics) {
        let option = {
            fromBlock: web3.utils.toHex(fromBlock),
            toBlock: web3.utils.toHex(toBlock),
            address: address,
            topics: topics
        }
        return await this.eth.getPastLogs(option)
    }

    /**
     * get current block number
     * @returns {Promise<void>} - block number
     */
    async getBlockNumber() {
        return await this.eth.getBlockNumber()
    }

    /**
     *
     * @param blockNumber
     * @param {boolean} isDetail  true: txDetail false: txHash
     * @returns {Promise<*>}
     */
    async getBlock(blockNumber, isDetail) {
        return await this.eth.getBlock(blockNumber, isDetail)
    }


    /**
     * get eth balance from chain !!! not token
     * @param address
     * @returns {Promise<*>}
     */
    async getBalance(address) {
        return await this.eth.getBalance(address)
    }
}

module.exports = {
    __TYPE,
    Network,
}
