# w3glue

## init

there three way to init the project

run on of these command:

- `npm i`
- `cnpm i`
- `yarn install`

## doc gen

the repo using gulp to generate document.

run `gulp doc` or `gulp`

then check them at ./docs/gen/

## Usage

### Core (glue.w3)

#### launch

```js
const {Mux} = require("w3glue")
let mux = new Mux("main", "http://127.0.0.1:7545")
```

#### deploy or attach

```js
mux.deployContract(tag, sender, args, {abi, bytecode}, extraGasLimit = 1) // {abi, bytecode} is a BOX
mux.attachContract(tag, address, {abi})
```

#### web3

```js
mux.provider
mux.eth
```

#### contract api

```js
let myContract = mux.getContract(tag) // glue-contract, not web3 contract
myContract.address
myContract.abi
myContract.provider
myContract.contract -- web3 contract
async myContract.events(eventName, fromBlock = 0, toBlock = 'latest', filter = undefined)
myContract.getMethod(methodName, ...args)

//c.listen // IPC needed
```

### Board

there is a easy way to create board from existed glue-contract
```js
myContract.toBoard(contractStr)
```

### Mux

you can create mux with code like this

```js
const {Mux} = require("w3glue")
let mux = new Mux("main", {
    urls:{
        http:"http://127.0.0.1:7545",
        ws:"ws://127.0.0.1:7546",
        ipc:"/var/www/test",
    }
})
```

then you can use code like this to specify a phase before using mux's api

```js
mux.$HTTP.provider...
mux.$WS.provider...
```

by the way, The phase you choose at the end will be retained.
This means that once you have selected a phase, the API after that will call the mux in that phase
HTTP is the default of mux, then WS is the default phase when HTTP does not exist, and finally IPC
If you using online string to create mux, it must be http
