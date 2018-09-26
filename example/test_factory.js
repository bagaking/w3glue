"using strict"

let load = require("../src/w3/muxFactory")

let chainData = {
    buildPath : `${__dirname}/contracts/`,
    networks : {
        main : {
            urls : {
                http : "http://localhost:7545",
                ws : "",
                ipc : ""
            },
            contracts : {
                AB01: {
                    address : "0x00",
                    deploy : {
                        sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                        args : [ "AB01", "AB01", "100000000" ]
                    },
                    contract : "Leblock"
                },
                AB02: {
                    address : "0x00",
                    deploy : {
                        sender : "0x7EA95C86192FdaB475f7De50257B1a3b55D19Aa0",
                        args : [ "AB02", "AB01",  "10000000" ]
                    },
                    contract : "Leblock"
                },
            }
        }
    }
}

load(chainData).then(x => console.log(JSON.stringify(x))).catch(console.log)