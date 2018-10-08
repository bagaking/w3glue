"using strict"

// ================ packages
const _ = require('lodash');
const log = require("../util/log")
const {__TYPE, Network} = require("./network")

const symHosts = Symbol("hostsConf")

class Mux extends Network {

    /**
     * Create Mux
     * @param {string} name
     * @param {string|Object.<urls:string,Object>}conf
     */
    constructor(name, conf) {
        let urls = null
        if (_.isString(conf)) {
            if (conf.startsWith("http://")) {
                urls = {http: conf}
            } else if (conf.startsWith("ws://")) {
                urls = {ws: conf}
            } else {
                urls = {ipc: conf}
            }
        } else {
            urls = conf.urls
        }

        let hosts = {}
        let lastType = null
        let tryCreateProvider = (typeName, type) => {
            hosts[type] = urls[typeName]
            lastType = type
        }

        tryCreateProvider("ipc", __TYPE.IPC)
        tryCreateProvider("ws", __TYPE.WS)
        tryCreateProvider("http", __TYPE.HTTP)
        super(lastType, hosts[lastType])

        this[symHosts] = hosts

        log.info(`     = mux ${name} created = : ${JSON.stringify(this)}`)
    }

    get hosts() {
        return this[symHosts]
    }

    get $HTTP() {
        return this.spawn(__TYPE.HTTP, this.hosts[__TYPE.HTTP])
    }

    get $WS() {
        return this.spawn(__TYPE.WS, this.hosts[__TYPE.WS])
    }

    get $IPC() {
        return this.spawn(__TYPE.IPC, this.hosts[__TYPE.IPC])
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