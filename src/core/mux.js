"using strict"

// ================ packages
const _ = require('lodash');
const log = require("../util/log")
const {__TYPE, Network} = require("./network")

const symHosts = Symbol("hostsConf")
const symProviders = Symbol("symProviders")

class Mux extends Network {

    /**
     * Create Mux
     * @param {string} name
     * @param {string|Object.<urls:string,Object>}conf
     */
    constructor(name, conf) {
        let urls = null
        if (_.isString(conf)) {
            if (conf.startsWith("http://")) {
                urls = {http: conf}
            } else if (conf.startsWith("ws://")) {
                urls = {ws: conf}
            } else {
                urls = {ipc: conf}
            }
        } else {
            urls = conf.urls
        }

        let hosts = {}
        let lastType = null
        let tryCreateProvider = (typeName, type) => {
            hosts[type] = urls[typeName]
            lastType = type
        }

        tryCreateProvider("ipc", __TYPE.IPC)
        tryCreateProvider("ws", __TYPE.WS)
        tryCreateProvider("http", __TYPE.HTTP)
        super(lastType, hosts[lastType])

        this[symHosts] = hosts

        log.info(`     = mux ${name} created = : ${JSON.stringify(this)}`)

        this[symProviders][lastType] = this

    }

    get hosts() {
        return this[symHosts]
    }

    _getOrCreateNetwork(type) {
        let result = this[symProviders][type]
        if (!result) {
            result = this[symProviders][type] = this.spawn(type, this.hosts[type])
        }
        return result
    }

    get $HTTP() {
        return this._getOrCreateNetwork(__TYPE.HTTP)
    }

    get $WS() {
        return this._getOrCreateNetwork(__TYPE.WS)
    }

    get $IPC() {
        return this._getOrCreateNetwork(__TYPE.IPC)
    }




}

module.exports = Mux