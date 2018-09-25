/**
 * @fileOverview the basic class of contract's instance
 * @author kinghand
 * @version 0.1
 */

"use strict"

// ================ local lib
const PromiseMethodCall = require('../util/').promisify.PromiseMethodCall


/**
 * Instance of contract
 * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
 */
class Contract {

    /**
     * bind a contract to specific tag
     * @param {Web3} provider
     * @param {Array} abiArray - the abi data
     * @param {constructor} contract constructor
     * @example
     * `let c = Contract.create(mux, abi)[.attach(address)]`
     */
    static create(provider, abiArray, contract = Contract) {
        return new contract(network, abiArray)
    }

    /**
     * Create a contract of a provider
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#new-contract
     * @param {Web3} provider
     * @param {Object} abi - contract's abi interface
     * @param {string} address - contract's address
     */
    constructor(provider, abi) {
        /** @type {Mux} */
        this.provider = provider;

        this.abi = abi;

        /** @type {Eth.Contract} */
        this.contract = null;
    }

    /**
     * Attach the contract to an c-address
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#options
     * @param {string} cAddress - address of the contract
     * @returns {Contract}
     */
    attach(cAddress) {
        this.contract = new this.provider.eth.Contract(this.abi, this.cAddress);
        return this
    }

    /**
     * Get the contract's address
     * @returns {string}
     */
    get address(){
        return this.contract.address
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

        let gas = this.provider.eth.estimateGas({data: byteCode});
        let gasPriceStr = await this.provider.eth.getGasPrice()

        this.contract = await this.contract.deploy({
            data: byteCode,
            arguments: args
        }).send({
            from: uAddress,
            gas: gas * 1.5 | 0,
            gasPrice: gasPriceStr,//'30000000000000'
        }, function (error, transactionHash) {
            console.log("deploy tx hash:" + transactionHash)
        }).on('error', function (error) {
            console.error(error);
        }).on('transactionHash', function (transactionHash) {
            console.log("hash:", transactionHash)
        }).on('receipt', function (receipt) {
            console.log(receipt.contractAddress); // contains the new contract address
        }).on('confirmation', function (confirmationNumber, receipt) {
            console.log("receipt,", receipt);
        }).catch(function (err) {
            console.log(err)
        })
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
    }

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

module.exports = Contract;