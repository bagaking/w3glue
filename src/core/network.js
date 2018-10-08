"using strict"

const Web3 = require('web3')     // document: https://web3js.readthedocs.io/en/1.0/index.html
const net = require('net')

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


class Network {

    constructor(type, host) {
        if (!_.isString(host)) throw new Error("host error: host address is not exist")
        this._provider = createProvider(type, host)
        this.prev = null
        this.newNum = 0

        /** @type {{Object.<string:Contract>}} */
        this._contracts = {}
    }

    spawn(type, host) {
        let child = new Network(type, host)
        child.prev = this
        this.newNum++
    }

    get provider() {
        return this._provider
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
        let result = this._contracts[tag]
        if (!_.isObject(result) && !!this.prev) {
            result = this.prev.getContract(tag)
            if (!!_.isObject(result)) {
                this.attachContract(tag, result.address, {abi: result.abi})
            }
        }
        return result
    }
}

module.exports = {
    __TYPE,
    Network,
}
