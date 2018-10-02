const chalk = require("chalk")

module.exports = {
    verb: (...args) => console.log(chalk.gray(...args)),
    log: (...args) => console.log(chalk.white(...args)),
    success: (...args) => console.log(chalk.cyan(...args)),
    failed: (...args) => console.log(chalk.magenta(...args)),
    info: (...args) => console.log(chalk.blue(...args)),
    warn: (...args) => console.log(chalk.yellow(...args)),
    err: (...args) => console.error(chalk.red(...args)),
    fatal: (...args) => console.error(chalk.bold.redBright(...args)),
    get usage(){
        this.verb("this","is","verb")
        this.log("this","is","log")
        this.success("this","is","success")
        this.failed("this","is","failed")
        this.info("this","is","info")
        this.warn("this","is","warn")
        this.err("this","is","err")
        this.fatal("this","is","fatal")
    }
}

