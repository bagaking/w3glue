let fs = require("fs");
let contract = require("truffle-contract");
let Deployer = require("truffle-deployer");


class ContractBox {

    /**
     * create a contract box
     * @param {{contractName, abi, bytecode}} boxData
     * @return {ContractBox}
     */
    static fromJson(boxData) {
        let {contractName, abi, bytecode} = boxData
        return new ContractBox(contractName, abi, bytecode)
    }

    constructor(contractName, abi, bytecode) {
        this.contractName = contractName
        this.abi = abi
        this.bytecode = bytecode
        this.truffleContract = contract({abi: abi, unlinked_binary: bytecode})
    }


}

class ContractDeployer {

    constructor() {
        /** @type {{string:ContractBox}} */
        this.boxLst = {}
    }

    /**
     * create box from boxData and insert it to boxLst
     * @param {{contractName, abi, bytecode}} boxData
     */
    addNetwork(tag, connStr) {
        let box = ContractBox.fromJson(boxData)
        this.boxLst[box.contractName] = box
    }

    /**
     * create box from boxData and insert it to boxLst
     * @param {{contractName, abi, bytecode}} boxData
     */
    addBox(boxData) {
        let box = ContractBox.fromJson(boxData)
        this.boxLst[box.contractName] = box
    }


    async deploy(contractName, sender, ...args) {
        let box = this.boxLst[contractName];
        let truffleContract = box.truffleContract

        let truffleDeployer = new Deployer({
            contracts: [truffleContract],
            network: "test",
            network_id: truffleContract.web3.version.network,
            provider: truffleContract.web3.currentProvider
        })

        let gas = truffleContract.web3.eth.estimateGas({data: truffleContract.bytecode})
        truffleDeployer.deploy(truffleContract, ...args, {
            from: sender,
            gas: gas * 1.2 | 0
        })

        return await truffleDeployer.start();
    }

}