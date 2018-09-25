"using strict"

const Mux = require("./mux")
const R = require("ramda")
const fs = require("fs")

let __All = {}

/*
    config like

    {
        buildPath : `${__dirname/../../build/}`
        networks {
            main : {
                urls : {
                    http : "http://127.0.0.1:8545"
                },
                contracts : {
                    AB01: {
                        address : "0x00",
                        deploy : {
                            sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                            args [ "AB01", "1000000000000000023081923" ]
                        },
                        contract : "AContract"
                    },
                    AB02: {
                        address : "0x00",
                        deploy : {
                            sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                            args [ "AB01", "$$AB01", "10000000000000123124100" ]
                        },
                        contract : "AnotherContract"
                    },
                }

            }
        }
    }
 */
async function load(chainData) {
    R.forEachObjIndexed(async (muxConf, muxName) => { //todo : async need be tested
        let mux = new Mux(muxConf)
        R.forEachObjIndexed(async (cConf, tag) => {
            let dataFile = JSON.parse(fs.readFileSync(`${chainData.buildPath}${cConf.contract}.json`, 'utf8'))
            if (cConf.address !== undefined && cConf.address !== null && cConf.address !== "0x00") {
                mux.attachContract(tag, cConf.address, dataFile)
                console.log(`attached : ${Json.stringify(cConf)}`)
            } else {
                let args = cConf.deploy.args.map(str => {
                    if(str.startsWith("$$")) return muxConf.contracts[str.substring(2)].address
                    return str //todo : implement {{}}
                })
                let c = await mux.deployContract(tag, cConf.deploy.sender, args, dataFile)
                cConf.address = c.address
                console.log(`deployed : ${Json.stringify(cConf)}\n with args: ${args} \n`)
            }
        }, muxConf.contracts)
        __All[muxName] = mux
    }, chainData.networks)
}