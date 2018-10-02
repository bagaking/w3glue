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

### launch

```js
const {Mux} = require("w3glue")
let mux = new Mux("main", "http://127.0.0.1:7545")
```

### deploy or attach

```js
mux.deployContract(tag, sender, args, {abi, bytecode}, extraGasLimit = 1)
mux.attachContract(tag, address, {abi})
```

### web3

```js
mux.provider
mux.eth
```

### contract api

```js
let c = mux.getContract(tag)
c.address
c.abi
c.provider
c.contract -- web3 contract
async c.events(eventName, fromBlock = 0, toBlock = 'latest', filter = undefined)
c.getMethod(methodName, ...args)
//c.listen // IPC needed
```