"using strict"

const Mux = require("../src/core/mux")
const fs =  require("fs")
const Path = require("path")

let mux = new Mux("main", {
    urls: {
        http: "http://127.0.0.1:7545",
        ws: "",
        ipc: ""
    }
})


let exe = async function() {
    let boxData = JSON.parse(fs.readFileSync(Path.join(__dirname, "contracts/Leblock.json"), 'utf8'))
    await mux.$HTTP.deployContract("AB01", "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E", ["AB01", "ABlock01", "100000000"], boxData)
    let contract = mux.$HTTP.getContract("AB01")
    console.log("===== " + contract.address)
    console.dir(contract._events)
    console.dir(contract._functions)
}

exe()