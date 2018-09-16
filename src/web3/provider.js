/**
 * @fileOverview A web3 provider
 * @author bagaking
 * @version 0.1
 */

import Web3 from 'web3'
import * as net from 'net'
import Axios from 'axios' // document: https://www.kancloud.cn/yunye/axios/234845

import {Contractance} from './contract'
// ====


const PROVIDER_TYPE = {
    HTTP: 0b001,
    WS: 0b010,
    IPC: 0b100
}

/**
 * Web3 Provider
 */
export class Provider {

    /**
     * Create a new provider
     * @param pConf - configuration of the provider's network
     */
    constructor(pConf) {
        // ====== init fields
        this.pInstance = new Web3();
        this.rpcSeq = 1;
        this.contactances = {}
        // ====== read conf
        this.connectString = pConf.connectString;
        // ====== create provider
        let provider = null
        if (pConf.type === PROVIDER_TYPE.HTTP) {
            provider = new Web3.providers.HttpProvider(this.connectString)
        } else if (pConf.type === PROVIDER_TYPE.WS) {
            provider = new Web3.providers.WebsocketProvider(this.connectString)
        } else if (pConf.type === PROVIDER_TYPE.IPC) {
            provider = new Web3.providers.IpcProvider(this.connectString, net)
        }
        this.pInstance.setProvider(provider)
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
            "id": this.rpcSeq++,
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
            this.pInstance.eth[method](...args, (err, res) => {
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
            fromBlock: this.pInstance.utils.toHex(fromBlock),
            toBlock: this.pInstance.utils.toHex(toBlock),
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
    async GetTransaction (txhash) {
        return await this.callEthMethod('getTransaction', txhash)
    }

    async GetTransactionReceipt (txhash) {
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
        this.contactances[tag] = new Contractance(this.pInstance, abi, cAddr);
    }

    /**
     * get a contract instance using specific tag
     * @param {string} tag - the tag binded
     * @returns {Contractance} - the contract
     */
    GetContract(tag) {
        return this.contactances[tag]
    }


}
