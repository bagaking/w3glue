/**
 * @fileOverview the basic class of contract's instance
 * @author kinghand
 * @version 0.1
 */

"use strict"

// ================ local lib
const PromiseMethodCall = require('../util/').promisify.PromiseMethodCall
const Provider = require('./provider')


let contractances = {
   // __anonymous : []
}

/**
 * Instance of contract
 * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
 */
class Contractance {



    /**
     * bind a contract to specific tag
     * @param {string} tag - the tag to bind
     * @param {Array} abi - the abi data
     * @param {constructor} contract constructor
     * @example
     * `let c = Contractance.create(tag, abi[, address])[.attach(address)]`
     */
    static create(tag, abi, contract){
        contract = contract || Contractance;
        contractances[tag] = new contract(abi);
        return contractances[tag]
    }

    /**
     * get a contract instance using specific tag
     * @param {string} tag - the tag binded
     * @returns {Contractance} - the contract
     */
    static visit(tag) {
        return contractances[tag]
    }

    /**
     * Create a contract of a provider
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#new-contract
     * @param {Object} abi - contract's abi interface
     * @param {string} address - contract's address
     */
    constructor(abi, address) {
        /** @type {Web3} */
        this._pInstance = null;
        this._abi = abi;
        this._address = address;
        /** @type {Eth.Contract} */
        this._contract = null;
    }


    get contract() {
        this._contract = new this._pInstance.eth.Contract(this._abi, this._address);
        return this._contract;
    }

    /**
     * Get cAddress of the contract
     * @returns {string}
     */
    get cAddress() {
        return this._address;
    }

    /**
     * Get abiArray(jsonInterface) of the contract
     * @returns {string}
     */
    get abi() {
        return this._abi;
    }

    /**
     * Attach the contract to an c-address
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#options
     * @param {string} cAddress - address of the contract
     * @returns {Contractance}
     */
    attach(cAddress) {
        this._address = cAddress;
        return this
    }

    /**
     * Deploy the contract to target network
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy
     * @param {string} byteCode
     * @param {string} uAddress - the address of publisher
     * @param {Array} args
     * @returns {Promise<Contractance>}
     */
    async deploy(byteCode, uAddress, ...args) {

        let gas = this._pInstance.eth.estimateGas({data:byteCode});
        let gasPriceStr = await web3.eth.getGasPrice()

        this._contract = await this.contract.deploy({
            data: byteCode,
            arguments: args
        }).send({
            from: uAddress,
            gas: gas * 1.5 | 0,
            gasPrice: gasPriceStr,//'30000000000000'
        }, function (error, transactionHash) {
            console.log("deploy tx hash:" + transactionHash)
        })
            .on('error', function (error) {
                console.error(error);
            })
            .on('transactionHash', function (transactionHash) {
                console.log("hash:", transactionHash)
            })
            .on('receipt', function (receipt) {
                console.log(receipt.contractAddress); // contains the new contract address
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log("receipt,", receipt);
            })
            .catch(function (err) {
                console.log(err)
            })
        return this
    }


    /**
     * Select HTTP
     * @returns {Contractance} this
     */
    get $HTTP(){
        this._pInstance = Provider.$.HTTP.get()._pInstance
        return this
    }

    /**
     * Select WS
     * @returns {Contractance} this
     */
    get $WS(){
        this._pInstance = Provider.$.WS.get()._pInstance
        return this
    }

    /**
     * Select IPC
     * @returns {Contractance} this
     */
    get $IPC() {
        this._pInstance = Provider.$.IPC.get()._pInstance
        return this
    }

    /**
     * Call a method of this contract
     * @param {string} methodName - name of the method
     * @param {...any} args - arguments
     * @returns {any} result
     */
    async callAsync(methodName, ...args) {
        console.log('call async ' + methodName + ' ' + args);
        let method = this.contract.methods[methodName](...args);
        return await PromiseMethodCall(method.call, method);
    };

    /**
     * Listen a event of this contract
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {string} filterFromAddr
     * @param {string} filterToAddr
     * @param {function} callback
     * @returns {Void}
     */
    listen(eventName, fromBlock, filterFromAddr, filterToAddr, callback) {
        let filter = {};
        if (typeof filterFromAddr !== "undefined") {
            filter._from = filterFromAddr
        }
        if (typeof filterToAddr !== "undefined") {
            filter._to = filterToAddr
        }
        this.contract.events[eventName]({
            filter: filter,
            fromBlock: fromBlock,
        }, callback)
    }

    //todo: transfer

}

module.exports = Contractance;