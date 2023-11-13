const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: "tl" }),
        winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
        winston.format.prettyPrint()
    ),
    transports: [
        // new winston.transports.Console(),
        // new winston.transports.File({ filename: "combined.log" }),
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, ".", "logs", `%DATE%.log`),
            datePattern: "YYYY-MM-DD",
            utc: true,
        }),
    ],
});
function logRecorder(msg, isErr) {
    if (!isErr) {
        console.log(msg);
        logger.info(msg)
    } else {
        console.error(msg);
        logger.error(msg)
    }
}


module.exports = {
    sleep,
    logger,
    logRecorder
}

