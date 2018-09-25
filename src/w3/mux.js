"using strict"

// ================ packages
const Web3 = require('web3')     // document: https://web3js.readthedocs.io/en/1.0/index.html
const net = require('net')
const Axios = require('axios')   // document: https://www.kancloud.cn/yunye/axios/234845

const Contract = require('./contract')

const __TYPE = {
    HTTP: Symbol("http"),
    WS: Symbol("ws"),
    IPC: Symbol("ipc")
}

class Mux {

    constructor({name, urls: {http, ws, ipc}, contracts}) {
        /** @type {string} */
        this._connectString = connStr;
        /** @type {number} */
        this._rpcSeq = 1
        /** @type {{}} */
        this._contracts = {}
        // ====== create provider

        this._providers = []

        if (ipc !== undefined && ipc !== null) {
            this[__TYPE.IPC] = new Web3().setProvider(new Web3.providers.IpcProvider(ipc, net))
            this._cur = __TYPE.IPC
            this._providers.push(this[this._cur])
        }

        if (ws !== undefined && ws !== null) {
            this[__TYPE.WS] = new Web3().setProvider(new Web3.providers.WebsocketProvider(ws))
            this._cur = __TYPE.WS
            this._providers.push(this[this._cur])
        }

        if (http !== undefined && http !== null) {
            this[__TYPE.HTTP] = new Web3().setProvider(new Web3.providers.HttpProvider(http))
            this._cur = __TYPE.HTTP
            this._providers.push(this[this._cur])
        }

        let x = this._cur
        this.select = (symbol = x) => {
            this._cur = symbol;
            return this;
        }
    }

    get $HTTP() {
        return this.select(__TYPE.HTTP);
    }

    get $WS() {
        return this.select(__TYPE.WS);
    }

    get $IPC() {
        return this.select(__TYPE.HTTP);
    }

    get provider() {
        return this[this._cur]
    }

    get eth() {
        return this.provider.eth
    }

    // muxMain.$WS.attachContract(tag, abi, address)
    attachContract(tag, address, {abi}){
        this._contracts[tag] = Contract.create(this.provider, abi).attach(address);
        return this._contracts[tag]
    }

    async deployContract(tag, sender, args, {abi, bytecode}) {
        this._contracts[tag] = await Contract.create(this.provider, abi).deploy(bytecode, sender, ...args);
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