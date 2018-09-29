"use strict"

const Contract = require("./contract")
const Mux = require("./mux")
const MuxFactory = require("./muxFactory")

const fs =  require("fs")

/**
 *
 * @param {string} host - host address and port by http protocal, just like "http://127.0.0.1:7545"
 * @param {string} path - path of the ContractName.json (which compiled by solc)
 * @param {string} sender - the sender's address, just like "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E"
 * @param {...string} args - a Array of arguments
 * @return {Promise<Contract>} address - the deployed address
 */
async function deployOnce(host, path, sender, ... args){
    let mux = new Mux("once", {
        urls: {
            http: host,
            ws: "",
            ipc: ""
        }
    })
    let boxData = JSON.parse(fs.readFileSync(path), 'utf8')
    await mux.$HTTP.deployContract("___", sender, args, boxData)
    let contract = mux.$HTTP.getContract("___")
    return contract
}

module.exports = {
    deployOnce,
    Contract,
    Mux,
    MuxFactory,
}