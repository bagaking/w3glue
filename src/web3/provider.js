/**
 * @fileOverview A web3 provider
 * @author bagaking
 * @version 0.1
 */

// ================ packages
import Web3 from 'web3'
import * as net from 'net'
import Axios from 'axios' // document: https://www.kancloud.cn/yunye/axios/234845

// ================ local lib
import {Contractance} from './contractance'

/**
 * Web3 Provider
 */
export class Provider {

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
     * connecting string
     * @example http://127.0.0.1:3003
     * @type {string}
     */
    connectString = ""

    /**
     * the sequence number of rpc
     * @type {number}
     * @private
     */
    _rpcSeq = 1;

    /**
     * web3 instance
     * @type {null}
     * @private
     */
    _pInstance = null

    /**
     * table of contractances
     * @type {{string:Contractance}}
     * @private
     */
    _contractances = {}

    /**
     * Create a new provider
     * @param {TYPE(number)} type - provider's type
     * @param {string} connectString - configuration of the provider's network
     */
    constructor(type, connectString) {
        this._connectString = connectString;

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

    // ========================================================== Region Util

    /**
     * Send jsonrpc to remote node (via http)
     * @param method - jsonrpc method
     * @param params - jsonrpc params
     * @returns rsp of ajax
     */
    async SendJsonRPC(method, ...params) {
        return await Axios.post(this.connectString, {
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

    /**
     * Call a method under provider.eth
     * @param {string} method - method of the provider's eth block to call
     * @param {...any} args - arguments
     * @returns {Promise<void>}
     */
    async CallEthMethod(method, ...args) {
        await new Promise((rsv, rsj) => {
            this._pInstance.eth[method](...args, (err, res) => {
                if (!err) {
                    rsv(res)
                } else {
                    rsj(err)
                }
            })
        })
    }

    // ========================================================== Region Methods : RPC

    /**
     * Create a new account
     * @param {string} pwd - the password of the new account
     * @returns rsp of ajax
     */
    async NewAccount(pwd) {
        return await SendJsonRPC("personal_newAccount", pwd)
    }

    // ========================================================== Region Methods : Provider

    async GetPastLogs(address, fromBlock, toBlock, topics) {
        let option = {
            fromBlock: this._pInstance.utils.toHex(fromBlock),
            toBlock: this._pInstance.utils.toHex(toBlock),
            address: address,
            topics: topics
        }
        return await this.callEthMethod('getPastLogs', option)
    }

    /**
     * get current block number
     * @returns {Promise<void>} - block number
     */
    async GetBlockNumber() {
        return await this.callEthMethod('getBlockNumber')
    }

    async GetBlock(blockNumber, isDetail) {
        return await this.callEthMethod('getBlock', blockNumber, isDetail)
    }

    /**
     * get transaction info
     * @param txhash
     * @returns {Promise<void>}
     */
    async GetTransaction(txhash) {
        return await this.callEthMethod('getTransaction', txhash)
    }

    async GetTransactionReceipt(txhash) {
        return await this.callEthMethod('getTransactionReceipt', txhash)
    }

    // ========================================================== Region Contracts

    /**
     * Load a contract of the provider, and bind it to specific tag
     * @param {string} tag - the tag to bind
     * @param {Object} abi - abi of the contract
     * @param {string} cAddr : address of the contract
     */
    LoadContract(tag, abi, cAddr) {
        this._contractances[tag] = new Contractance(this._pInstance, abi, cAddr);
    }

    /**
     * get a contract instance using specific tag
     * @param {string} tag - the tag binded
     * @returns {Contractance} - the contract
     */
    GetContract(tag) {
        return this._contractances[tag]
    }



}
