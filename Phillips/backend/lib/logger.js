const log4js = require("log4js");
log4js.configure({
    appenders: { app: { type: "file", filename: "backend.log" } },
    categories: { default: { appenders: ["app"], level: "all" } }
});

const logger = log4js.getLogger("app")

module.exports.info = (...args) =>{
    console.info(...args)
    logger.info(...args)
}
module.exports.error = (...args) =>{
    console.log(...args)
    logger.error(...args)
}