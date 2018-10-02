'using strict'

let symMyContract = Symbol("symMyContract")

class CBoard {

    constructor(contractStr, address, contract) {
        this.contractStr = contractStr
        this.address = address

        /** @type {tContract} */
        this[symMyContract] = contract
    }

    get contract() {
        return this[symMyContract]
    }

    get toObject() {
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
     *
     * @param {function(contractStr:string, address:string)} fnContractLoader - the fn receives two args contractStr and address, and then return the contract
     * @return {Promise<void>}
     */
    async makeContract(fnContractLoader){
        let call = fnContractLoader(contractStr, address)
        this[symMyContract] = call instanceof Promise ? await call : call
    }


}

module.exports = CBoard
