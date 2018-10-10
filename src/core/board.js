'use strict'

let symMyContract = Symbol("symMyContract")

class CBoard {

    /**
     *
     * @param {string} contractStr - Require : the contract string,
     * @param {string} address - Must : the contracts address
     * @param {Contract} contract - Optional : contract that already exist
     */
    constructor(contractStr, address, contract) {
        this.contractStr = contractStr
        this.address = address

        /** @type {Contract} */
        this[symMyContract] = contract
    }

    /**
     * get the glue contract
     * @return {Contract}
     */
    get contract() {
        return this[symMyContract]
    }

    /**
     * convet to plain object
     * @return {{contractStr: string, address: string}}
     */
    get toPlainObject() {
        return {
            contractStr: this.contractStr,
            address: this.address
        }
    }

    /**
     * To Json String
     * @param {(number|string)[]} replacer
     * @param {number|string} space
     * @return {string}
     */
    toJsonStr(replacer = null, space = null) {
        return JSON.stringify(this, replacer, space)
    }

    /**
     * create a glue contract
     * @param {function(contractStr:string, address:string)} fnContractLoader - the fn receives two args contractStr and address, and then return the contract
     * @return {Promise<Contract>}
     */
    async makeContract(fnContractLoader){
        let call = fnContractLoader(contractStr, address)
        this[symMyContract] = call instanceof Promise ? await call : call
        return this[symMyContract]
    }


}

module.exports = CBoard
