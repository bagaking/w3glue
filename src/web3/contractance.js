/**
 * Instance of contract
 */
export class Contractance {

    /**
     * Create a contract of a provider
     * @param {Provider} pInstance - instance of provider
     * @param {Object} abi - contract's abi interface
     * @param {string} cAddress - contract's address
     */
    constructor(pInstance, abi, cAddress) {
        this.pInstance = pInstance
        this.contract = new this.pInstance.eth.Contract(abi, cAddress)
    }

    /**
     * Call a method of this contract
     * @param {string} methodName - name of the method
     * @param {...any} args - arguments
     * @returns {any} result
     */
    async callAsync(methodName, ...args) {
        console.log('call async ' + methodName + ' ' + args)

        return await new Promise(function (resolve, reject) {
            this.contract.methods[methodName](...args).call(function (error, result) {
                if (!error) {
                    resolve(result)
                } else {
                    reject(error)
                }
            });
        });
    };

    /**
     * Listen a event of this contract
     * @param {string} eventName
     * @param {number} fromBlock
     * @param {string} filterFromAddr
     * @param {string} filterToAddr
     * @param {function} callback
     * @returns {Promise<void>}
     */
    async listen(eventName, fromBlock, filterFromAddr, filterToAddr, callback) {
        let filter = {}
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

}

/**
 * contract which implement interfaces of erc20
 * @see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 * @extends Contractance
 */
export class CERC20 extends Contractance {

    constructor(pInstance, abi, cAddress) {
        super(pInstance, abi, cAddress)
    }

    async GetBalance(addr) {
        return await this.callAsync("balanceOf", addr)
    }

}