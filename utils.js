const winston = require("winston");
const robot = require('robotjs');
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

function snipaste() {
    // const Tesseract = require('tesseract.js');

    // 设置截图区域
    const screenBounds = robot.getScreenSize();
    const captureWidth = 50;
    const captureHeight = 10;
    const captureX = 100;
    const captureY = 139

    // 截图
    const screenCapture = robot.screen.capture(captureX, captureY, captureWidth, captureHeight);
    // 将截图保存为临时文件
    const fs = require('fs');
    const screenshotPath = './screenshot.png';
    fs.writeFileSync(screenshotPath, screenCapture.image, '');
    tesseract.recognize(
        screenCapture.image,
        { lang: 'eng' } // 使用英语语言模型，你可以根据需要更改语言
    ).then(({ data: { text } }) => {
        // 输出识别结果
        console.log('OCR Result:', text);
    }).catch((error) => {
        console.error('OCR Error:', error);
    });
    // fs.writeFileSync(screenshotPath, screenCapture.image, 'binary', (err) => {
    //     if (err) {
    //         console.error('保存文件出错：', err);
    //     } else {
    //         console.log('文件保存成功:', filePath);
    //     }
    // });
}




module.exports = {
    sleep,
    logger,
    logRecorder,
    snipaste
}

