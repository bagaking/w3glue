"using strict"

// ================ packages
const _ = require('lodash');
const Web3 = require('web3')     // document: https://web3js.readthedocs.io/en/1.0/index.html
const net = require('net')
const log = require("../util/log")

const Contract = require('./contract')

const __TYPE = {
    HTTP: Symbol("http"),
    WS: Symbol("ws"),
    IPC: Symbol("ipc")
}

const symProviders = Symbol("provider")

class Mux {

    /**
     * Create Mux
     * @param {string} name
     * @param {string|Object.<urls:string,Object>}conf
     */
    constructor(name, conf) {
        /** @type {number} */
        this._rpcSeq = 1
        /** @type {{Object.<string:Contract>}} */
        this._contracts = {}
        // ====== create provider

        this[symProviders] = []
        let urls = null
        if (_.isString(conf)) {
            if(conf.startsWith("http://")) {
                urls = {http: conf}
            } else if(conf.startsWith("ws://")) {
                urls = {ws: conf}
            } else{
                urls = {ipc: conf}
            }
        } else {
            urls = conf.urls
        }
        if (urls.ipc !== undefined && urls.ipc !== null && urls.ipc.length > 0) {
            this[__TYPE.IPC] = new Web3()
            this[__TYPE.IPC].setProvider(new Web3.providers.IpcProvider(urls.ipc, net))
            this[symProviders].push(__TYPE.IPC)
            this._cur = __TYPE.IPC
        }

        if (urls.ws !== undefined && urls.ws !== null && urls.ws.length > 0) {
            this[__TYPE.WS] = new Web3()
            this[__TYPE.WS].setProvider(new Web3.providers.WebsocketProvider(urls.ws))
            this[symProviders].push(__TYPE.WS)
            this._cur = __TYPE.WS
        }

        if (urls.http !== undefined && urls.http !== null && urls.http.length > 0) {
            this[__TYPE.HTTP] = new Web3()
            this[__TYPE.HTTP].setProvider(new Web3.providers.HttpProvider(urls.http))
            this[symProviders].push(__TYPE.HTTP)
            this._cur = __TYPE.HTTP
        }

        log.info(`     = mux ${name} created = : ${JSON.stringify(this)}`)
        //console.dir(this)
    }

    get $HTTP() {
        this._cur = __TYPE.HTTP;
        return this;
    }

    get $WS() {
        this._cur = __TYPE.WS;
        return this;
    }

    get $IPC() {
        this._cur = __TYPE.IPC;
        return this;
    }

    get provider() {
        return this[this._cur]
    }

    get providers() {
        return this[symProviders]
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
        this._contracts[tag] = contract.deploy(bytecode, sender, ...args);
        return this._contracts[tag]
    }

    /**
     * get a contract
     * @param tag
     * @return {Contract}
     */
    getContract(tag) {
        return this._contracts[tag]
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

    // ========================================================== Region Methods : Provider

    async getPastLogs(address, fromBlock, toBlock, topics) {
        let option = {
            fromBlock: this.web3.utils.toHex(fromBlock),
            toBlock: this.web3.utils.toHex(toBlock),
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

    /**
     * get eth balance from chain !!! not token
     * @param address
     * @returns {Promise<*>}
     */
    async getBalance(address) {
        return await this.eth.getBalance(address)
    }

}

module.exports = Mux