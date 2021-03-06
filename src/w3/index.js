"use strict"

const Contract = require("../core/contract")
const Mux = require("../core/mux")
const MuxFactory = require("./muxFactory")
const Axios = require('axios')   // document: https://www.kancloud.cn/yunye/axios/234845

const fs =  require("fs")

/**
 * deployOnce with extra gasLimit
 * @param {string} host - host address and port by http protocal, just like "http://127.0.0.1:7545"
 * @param {string} path - path of the ContractName.json (which compiled by solc)
 * @param {string} sender - the sender's address, just like "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E"
 * @param {number} extraGasLimit - extra gas limit
 * @param {...string} args - a Array of arguments
 * @return {Promise<Contract>} address - the deployed address
 */
async function deployOnceWithExtraGasLimit(host, path, sender, extraGasLimit, ... args){
    let mux = new Mux("once", { urls: { http: host }})
    let boxData = JSON.parse(fs.readFileSync(path), 'utf8')
    await mux.$HTTP.deployContract("___", sender, args, boxData, extraGasLimit)
    let contract = mux.$HTTP.getContract("___")
    return contract
}

/**
 * deployOnce
 * @param {string} host - host address and port by http protocal, just like "http://127.0.0.1:7545"
 * @param {string} path - path of the ContractName.json (which compiled by solc)
 * @param {string} sender - the sender's address, just like "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E"
 * @param {...string} args - a Array of arguments
 * @return {Promise<Contract>} address - the deployed address
 */
async function deployOnce(host, path, sender, ... args){
    return await deployOnceWithExtraGasLimit(host, path, sender, 0, ... args)
}


module.exports = {
    deployOnce,
    deployOnceWithExtraGasLimit,
    Mux,
    MuxFactory,
}