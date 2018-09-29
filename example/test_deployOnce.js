"using strict"

const {deployOnce} = require("../src/w3")

const contractPath = `${__dirname}/contracts/Leblock.json`
async function exe(){
    let contract = await deployOnce("http://127.0.0.1:7545", contractPath, "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E", "AB01", "ABlock01", "100000000")
    console.log(contract.address)
    let totalSupply = await contract.callAsync("totalSupply")
    console.log(totalSupply)
}

exe()