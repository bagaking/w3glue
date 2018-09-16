/**
 * Instance of contract
 * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
 */
export class Contractance {

    _pInstance = null

    _contract = null

    /**
     * Create a contract of a provider
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#new-contract
     * @param {Provider} pInstance - instance of provider
     * @param {Object} abi - contract's abi interface
     * @param {string} cAddress - contract's address
     */
    constructor(pInstance, abi) {
        this._pInstance = pInstance
        this._contract = new this._pInstance.eth.Contract(abi)
    }

    /**
     * Get cAddress of the contract
     * @returns {string}
     */
    get cAddress() {
        return this._contract.options.address
    }

    /**
     * Get abiArray(jsonInterface) of the contract
     * @returns {string}
     */
    get abi() {
        return this._contract.options.jsonInterface
    }

    /**
     * Attach the contract to an c-address
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#options
     * @param {string} cAddress - address of the contract
     * @returns {Contractance}
     */
    attach(cAddress) {
        this._contract.options.address = cAddress
        return this
    }

    /**
     * Deploy the contract to target network
     * @see https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy
     * @param {string} bitCode
     * @param {[]} args
     * @returns {Contractance}
     */
    async deploy(bitCode, pubKey, ...args) {
        let newContractInstance = await this._contract.deploy({
            data: bitCode,
            arguments: args
        }).send({
            from: pubKey,
            gas: 1500000,
            gasPrice: '30000000000000'
        }, function (error, transactionHash) {
            console.log("deploy tx hash:" + transactionHash)
        })
            .on('error', function (error) {
                console.error(error);
            })
            .on('transactionHash', function (transactionHash) {
                console.log("hash:", transactionHash)
            })
            .on('receipt', function (receipt) {
                console.log(receipt.contractAddress); // contains the new contract address
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log("receipt,", receipt);
            })
            .catch(function (err) {
                console.log(err)
            })
        this._contract = newContractInstance
        return this
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

    constructor(pInstance, abi) {
        super(pInstance, abi)
    }

    async GetBalance(addr) {
        return await this.callAsync("balanceOf", addr)
    }

}