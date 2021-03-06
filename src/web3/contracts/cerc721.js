/**
 * @fileOverview export standard ERC721 token interface
 * @author kinghand
 * @version 0.1
 */

"use strict"

const Contractance = require("../contractance")

/**
 * contract which implement interfaces of erc20
 * @see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 * @extends Contractance
 * @desc
 * the interface of contracts
 */
class CERC721 extends Contractance {

    constructor(pInstance, abi) {
        super(pInstance, abi)
    }

    async totalSupply() {
        return await this.callAsync("totalSupply")
    }

    async balanceOf(addr) {
        return await this.callAsync("balanceOf", addr)
    }

    async balanceOf(addr) {
        return await this.callAsync("balanceOf", addr)
    }

}

module.exports = CERC721