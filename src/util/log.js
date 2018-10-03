const chalk = require("chalk")

const log = console.log
const error = console.error


module.exports = {
    verbose: (...args) => log(chalk.gray(...args)),
    log: (...args) => log(chalk.white(...args)),

    success: (...args) => log(chalk.underline.cyan(...args)),
    failed: (...args) => log(chalk.underline.magenta(...args)),
    info: (...args) => log(chalk.italic.blue(...args)),

    warn: (...args) => log(chalk.yellow(...args)),

    err: (...args) => error(chalk.red(...args)),
    fatal: (...args) => error(chalk.underline.bold.redBright(...args)),
    get usage(){
        this.verbose("this","is","verbose")
        this.log("this","is","log")
        this.success("this","is","success")
        this.failed("this","is","failed")
        this.info("this","is","info")
        this.warn("this","is","warn")
        this.err("this","is","err")
        this.fatal("this","is","fatal")
    }
}

