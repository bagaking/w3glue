import Web3 from 'web3'
import * as net from 'net'
import Axios from 'axios'

import {Contractance} from './contract'
// ====


const PROVIDER_TYPE = {
    HTTP: 0b001,
    WS: 0b010,
    IPC: 0b100
}

export class Provider {

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
     * @param method : jsonrpc method
     * @param params : jsonrpc params
     * @returns rsp of ajax
     * @constructor
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
     * @param method
     * @param args
     * @returns {Promise<void>}
     */
    async callEthMethod(method, ...args) {
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
     *
     * @param pwd : the password of the new account
     * @returns rsp of ajax
     * @constructor
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

    async GetBlockNumber() {
        return await this.callEthMethod('getBlockNumber')
    }

    async GetBlock(blockNumber, isDetail) {
        return await this.callEthMethod('getBlock', blockNumber, isDetail)
    }

    async GetTransaction (txhash) {
        return await this.callEthMethod('getTransaction', txhash)
    }

    async GetTransactionReceipt (txhash) {
        return await this.callEthMethod('getTransactionReceipt', txhash)
    }

    // ========================================================== Region Contracts

    /**
     *
     * @param tag : load a contract instance, and bind it to specific tag
     * @param abi : abi of the contract
     * @param cAddr : address of the contract
     * @constructor
     */
    LoadContract(tag, abi, cAddr) {
        this.contactances[tag] = new Contractance(this.pInstance, abi, cAddr);
    }

    /**
     *
     * @param tag : get a contract instance using specific tag
     * @returns {*} : the contract
     * @constructor
     */
    GetContract(tag) {
        return this.contactances[tag]
    }


}
