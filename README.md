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
const {Mux} = require("w3glue").w3
let mux = new Mux("main", "http://127.0.0.1:7545")
```

#### deploy or attach

```js
mux.deployContract(tag, sender, args, {abi, bytecode}, extraGasLimit = 1)
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

### board

there is a easy way to create board from existed glue-contract
```js
myContract.toBoard(contractStr)
```