/**
 * @fileOverview the class maintained web3 provider instance
 * @author kinghand
 * @version 0.1
 */

"use strict"

// ================ packages
import Web3 from 'web3'     // document: https://web3js.readthedocs.io/en/1.0/index.html
import * as net from 'net'
import Axios from 'axios'   // document: https://www.kancloud.cn/yunye/axios/234845

// ================ local lib
import {Contractance} from './contractance'
import {PromiseMethodCall} from '../util'

/**
 * Web3 Provider
 */
class Provider {

    /**
     * Enum of providers' type
     * @readonly
     */
    static TYPE = {
        HTTP: 0b001,
        WS: 0b010,
        IPC: 0b100
    }

    /**
     * Create a new provider
     * @param {TYPE(number)} type - provider's type
     * @param {string} connectString - configuration of the provider's network
     */
    constructor(type, connectString) {
        /** @type {string} */
        this._connectString = connectString;
        /** @type {number} */
        this._rpcSeq = 1
        /** @type {{}} */
        this._contractances = {}
        // ====== create provider
        this._pInstance = new Web3();
        let provider = null
        if (type === Provider.TYPE.HTTP) {
            provider = new Web3.providers.HttpProvider(this._connectString)
        } else if (type === Provider.TYPE.WS) {
            provider = new Web3.providers.WebsocketProvider(this._connectString)
        } else if (type === Provider.TYPE.IPC) {
            provider = new Web3.providers.IpcProvider(this._connectString, net)
        }
        this._pInstance.setProvider(provider)
    }

    /**
     * the eth object of pInstance
     * @returns {Eth}
     */
    get eth() {
        return this._pInstance.eth
    }

    // ========================================================== Region Util

    /**
     * Send jsonrpc to remote node (via http)
     * @param method - jsonrpc method
     * @param params - jsonrpc params
     * @returns rsp of ajax
     */
    async sendJsonRPC(method, ...params) {
        return await Axios.post(this._connectString, {
            "jsonrpc": "2.0",
            "id": this._rpcSeq++,
            "method": method,
            "params": params,
        }, {
            json: true,
            headers: {
                "content-type": "application/json",
            },
        })
    }


    // ========================================================== Region Methods : RPC

    /**
     * Create a new account
     * @param {string} pwd - the password of the new account
     * @returns rsp of ajax
     */
    async newAccount(pwd) {
        let p = this.eth.personal
        return await PromiseMethodCall(p.newAccount, p, pwd)
    }

    async unlockAccount(address, password, duration) {
        let p = this.eth.personal
        await await PromiseMethodCall(p.unlockAccount, p, address, password, duration)
        return address
    };

    async sign(dataToSign, address, password) {
        let p = this.eth.personal
        return await PromiseMethodCall(p.sign, p, dataToSign, address, password)
    }

    // ========================================================== Region Methods : Provider

    async getPastLogs(address, fromBlock, toBlock, topics) {
        let option = {
            fromBlock: this._pInstance.utils.toHex(fromBlock),
            toBlock: this._pInstance.utils.toHex(toBlock),
            address: address,
            topics: topics
        }
        return await PromiseMethodCall(this.eth.getPastLogs, this.eth, option)
    }

    /**
     * get current block number
     * @returns {Promise<void>} - block number
     */
    async getBlockNumber() {
        return await PromiseMethodCall(this.eth.getBlockNumber, this.eth)
    }

    async getBlock(blockNumber, isDetail) {
        return await PromiseMethodCall(this.eth.getBlock, this.eth, blockNumber, isDetail)
    }

    /**
     * get transaction info
     * @param txhash
     * @returns {Promise<void>}
     */
    async getTransaction(txhash) {
        return await this.callMethod(this._pInstance.eth.getTransaction, txhash)
    }

    async getTransactionReceipt(txhash) {
        return await this.callMethod(this._pInstance.eth.getTransactionReceipt, txhash)
    }

    // ========================================================== Region Contracts

    /**
     * Load a contract of the provider, and bind it to specific tag
     * @param {string} tag - the tag to bind
     * @param {Object} abi - abi of the contract
     * @param {string} cAddress - address of the contract
     */
    loadContract(tag, abi, cAddress) {
        this.addContract(tag, new Contractance(this._pInstance, abi).attach(cAddress));
    }

    /**
     * bind a contract to specific tag
     * @param {string} tag - the tag to bind
     * @param {Contractance} contract - the contract instance
     */
    addContract(tag, contract) {
        this._contractances[tag] = contract;
    }

    /**
     * get a contract instance using specific tag
     * @param {string} tag - the tag binded
     * @returns {Contractance} - the contract
     */
    getContract(tag) {
        return this._contractances[tag]
    }


}

export default Provider