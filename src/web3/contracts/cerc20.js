/**
 * @fileOverview export standard ERC20 token interface
 * @author kinghand
 * @version 0.1
 */

"use strict"

const Contractance = require("../contractance")

/**
 * contract which implement interfaces of erc20
 * @see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 * @extends Contractance
 * @desc
 * the interface of contracts
 * ```solidity
 *  contract ERC20Interface {
 *       function totalSupply() public view returns (uint256);
 *       function balanceOf(address tokenOwner) public view returns (uint256 balance);
 *       function allowance(address tokenOwner, address spender) public view returns (uint256 remaining);
 *       function transfer(address to, uint256 tokens) public returns (bool success);
 *       function approve(address spender, uint256 tokens) public returns (bool success);
 *       function transferFrom(address from, address to, uint256 tokens) public returns (bool success);
 *
 *       event Transfer(address indexed from, address indexed to, uint256 tokens);
 *       event Approval(address indexed tokenOwner, address indexed spender, uint256 tokens);
 *  }
 *  ```
 */
class CERC20 extends Contractance {

    constructor(pInstance, abi) {
        super(pInstance, abi)
    }

    // ==================================== region call

    async totalSupply() {
        return await this.callAsync("totalSupply")
    }

    async balanceOf(tokenOwner) {
        return await this.callAsync("balanceOf", addr)
    }

    async allowance(tokenOwner, spender) {
        return await this.callAsync("balanceOf", addr)
    }

    // ==================================== todo : region transfer

    // ==================================== todo : region event

    // OnTransfer(cb){
    //     this.listen("Transfer", )
    // }


}

module.exports = CERC20