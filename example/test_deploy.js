"using strict"

const Mux = require("../src/core/mux")
const fs =  require("fs")

let buildPath = `${__dirname}/contracts/`
let cConf = {
    address: "0x00",
    deploy: {
        sender: "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E",
        args: ["AB01", "ABlock01", "100000000"]
    },
    contract: "Leblock"
}

let mux = new Mux("main", {
    urls: {
        http: "http://127.0.0.1:7545",
        ws: "",
        ipc: ""
    }
})

let ret = (function() {
    console.log(`   - cConf : ${cConf.contract}`)
    let dataFile = JSON.parse(fs.readFileSync(`${buildPath}${cConf.contract}.json`, 'utf8'))
    console.log(`   - cConf : ${JSON.stringify(cConf)}`)

    // todo: select http/ws/ipc
    if (cConf.address !== undefined && cConf.address !== null && cConf.address !== "0x00") {
        console.log(`   -- attach ${cConf.address}`)
        mux.$HTTP.attachContract(tag, cConf.address, dataFile)
        console.log(`attached : ${JSON.stringify(cConf)}`)
    } else {
        let args = cConf.deploy.args.map(str => {
            if (str.startsWith("$$")) return muxConf.contracts[str.substring(2)].address
            return str //todo : implement {{}}
        })
        console.log(`   -- deploy ${args}`)
        let c = mux.$HTTP.deployContract("Name", cConf.deploy.sender, args, dataFile)
        // cConf.address = c.address
        // console.log(`deployed : ${JSON.stringify(cConf)}\n with args: ${args} \n`)

        console.log(mux.$HTTP.getContract("Name"))
    }
})()