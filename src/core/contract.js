/**
 * @fileOverview the basic class of contract's instance
 * @author kinghand
 * @version 0.1
 */

"use strict"

// ================ local lib
const PromiseMethodCall = require('../util/index').promisify.PromiseMethodCall
const CBoard = require("./board")

const symbolContract = Symbol("contract")
const symbolProvider = Symbol("provider")



/**
 * Instance of contract
 * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
 */
class aContract {

    /**
     * bind a contract to specific tag
     * @param {Web3} provider
     * @param {Array} abiArray - the abi data
     * @param {constructor} contract constructor
     * @return {Contract}
     * @example
     * `let c = Contract.create(mux, abi)[.attach(address)]`
     */
    static create(provider, abiArray, contract = Contract) {
        let c = new contract(provider, abiArray)
        return c
    }

    /**
     * Create a contract of a provider
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#new-contract
     * @param {Web3} provider
     * @param {Array<Object>} abi - contract's abi interface
     * @param {string} address - contract's address
     */
    constructor(provider, abi) {
        this[symbolProvider] = provider;

        /** @type {Eth.Contract} */
        this[symbolContract] = new this.provider.eth.Contract(abi);

        console.log(`   --- contract created. provider: ${provider}`)
    }

    /**
     * get provider
     * @returns {Web3}
     */
    get provider() {
        return this[symbolProvider]
    }

    /**
     * get contract instance
     * @returns {Web3.Eth.Contract}
     */
    get contract() {
        return this[symbolContract]
    }

    toBoard(contractStr){
        return new CBoard(contractStr, this.address, this)
    }


    /**
     * Attach the contract to an c-address
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#options
     * @param {string} cAddress - address of the contract
     * @returns {Contract}
     */
    attach(cAddress) {
        this.contract.options.address = cAddress
        return this
    }

    /**
     * Get the contract's address
     * @returns {string}
     */
    get address() {
        return this.contract.options.address
    }

    /**
     * Get the contract's abi
     * @returns {string}
     */
    get abi() {
        return this.contract.options.jsonInterface
    }

    /**
     * Get the contract's events
     * @param {string} eventName
     * @param {number|string} fromBlock
     * @param {number|string} toBlock
     * @return {Promise<Array>} events
     */
    async events(eventName, fromBlock = 0, toBlock = 'latest', filter = undefined) {
        let options = {
            fromBlock,
            toBlock
        } // web3's bug: if there no options, nothing will return
        if (!!filter) option.filter = filter
        return await this.contract.getPastEvents(eventName, options)

    }

    /**
     * Deploy the contract to target network
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy
     * @param {string} byteCode
     * @param {string} senderAddress - the address of publisher
     * @param {Array} args
     * @returns {Promise<Contractance>}
     */
    async deploy(byteCode, senderAddress, ...args) {
        let con = new this.provider.eth.Contract(this.abi, null, {
            from: senderAddress
        })

        let depInfo = {
            data: byteCode,
            arguments: args
        }

        let deployer = con.deploy(depInfo)

        console.log(`   ---- start deploy`)
        let gas = await new Promise((rsv, rej) => deployer.estimateGas((err, gasE) => {
            if (err) {
                console.log(err);
                rej(err)
            } else {
                rsv(gasE)
            }
        })) || 1500000;
        let gasPriceStr = await this.provider.eth.getGasPrice()
        let extraGasLimit = this["extraGasLimit"] || 0 //trick
        let transactionInfo = {
            from: senderAddress,
            gas: (gas * 1.1) + extraGasLimit | 0,
            gasPrice: gasPriceStr,//'30000000000000'
        }
        console.log(`deploy contract with ${JSON.stringify(transactionInfo)}`)


        con = await deployer.send(transactionInfo, (error, transactionHash) => console.log("deploy tx hash:" + transactionHash)).catch(console.log)
        // .on('error', function (error) {
        //         //     console.error(error);
        //         // }).on('transactionHash', function (transactionHash) {
        //         //     console.log("hash:", transactionHash)
        //         // }).on('receipt', function (receipt) {
        //         //     console.log(receipt.contractAddress); // contains the new contract address
        //         // }).on('confirmation', function (confirmationNumber, receipt) {
        //         //     console.log("receipt received!");
        //         //     //console.log("receipt,", receipt);
        //         // })

        //     .then((newContractInstance) => {
        //     console.log(newContractInstance.options.address); // instance with the new contract address
        // })

        console.log(`deployed.`)
        this[symbolContract] = con
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
        let method = this.getMethod(methodName, ...args)
        return await PromiseMethodCall(method.call, method);
    }

    /**
     * get web3 contract's method
     * @param {string} methodName - name of the method
     * @param {...any} args - arguments
     * @returns {*} result
     */
    getMethod(methodName, ...args) {
        return this.contract.methods[methodName](...args)
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