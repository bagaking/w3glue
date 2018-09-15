export class Contractance {

    constructor(pInstance, abi, cAddr) {
        this.pInstance = pInstance
        this.contract = new this.pInstance.eth.Contract(abi, cAddr)
    }

    async CallAsync(methodName, ...args) {
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

    async Listen(eventName, fromBlock, filterFromAddr, filterToAddr, callback) {
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

export class CERC20 extends Contractance {

    async GetBalance(addr) {
        return await this.CallAsync("balanceOf", addr)
    }

}