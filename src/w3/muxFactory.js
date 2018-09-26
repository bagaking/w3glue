"using strict"

const Mux = require("./mux")
const R = require("ramda")
const fs = require("fs")
/*
    config like

    {
        buildPath : `${__dirname}/contracts/`,
        networks : {
            main : {
                urls : {
                    http : "http://localhost:545",
                    ws : "ws://localhost:8546",
                    ipc : ""
                },
                contracts : {
                    AB01: {
                        address : "0x00",
                        deploy : {
                            sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                            args : [ "AB01", "100000000" ]
                        },
                        contract : "AContract"
                    },
                    AB02: {
                        address : "0x00",
                        deploy : {
                            sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                            args : [ "AB02", "10000000" ]
                        },
                        contract : "AnotherContract"
                    },
                }
            }
        }
    }
 */

module.exports = async function load(chainData) {

    let allMux = {}
    R.forEachObjIndexed(async (muxConf, muxName) => { //todo : async need be tested
        console.log(`=== start load\n${JSON.stringify(muxConf)}`)
        let mux = new Mux(muxName, muxConf)
        R.forEachObjIndexed(async (cConf, tag) => {
            let dataFile = JSON.parse(fs.readFileSync(`${chainData.buildPath}${cConf.contract}.json`, 'utf8'))
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
                let c = await mux.$HTTP.deployContract(tag, cConf.deploy.sender, args, dataFile)
                cConf.address = c.address
                console.log(`deployed : ${JSON.stringify(cConf)}\n with args: ${args} \n`)
            }
        }, muxConf.contracts)
        allMux[muxName] = mux
    }, chainData.networks)
    return allMux
}