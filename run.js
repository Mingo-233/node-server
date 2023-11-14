const robot = require("robotjs");
const { sleep, logger, logRecorder } = require('./utils')

const num = 1;

const mousePosition = {
    scarecrowOne: { x: 598, y: 339 },
    // scarecrowTwo: { x: 518, y: 735 },
    talkOptionsFirst: { x: 500, y: 500 },
    talkOptionsSecond: { x: 500, y: 500 },
    collectAreaOne: [{ x: 500, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 500 },],
    // collectAreaTwo: [{ x: 500, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 500 }, { x: 500, y: 500 },],
    goodsPick: { x: 900, y: 500 },
};
const waitTime = {
    collect: 1000,
    grow: 1000 * 60 * 5 + 1000,
    delayStart: 3000
}
function getAreaColor() {
    // 获取屏幕宽度和高度
    const { width, height } = robot.getScreenSize();
    // 定义要检查的区域的坐标
    const x = 900;
    const y = 500;

    // 获取指定点的颜色信息
    const color = robot.getPixelColor(x, y);

    console.log(`颜色值：#${color.toString(16)}`);
}
function mouseClickHandle(x, y) {
    // 设置鼠标位置
    const mouseX = x || 500;
    const mouseY = y || 500;
    robot.moveMouseSmooth(mouseX, mouseY);

    // 模拟鼠标左键点击
    robot.mouseClick();
}

let executeAction = {
    current: 0,
    value: {
        x: 500,
        y: 500
    },
    setValue: function () {
        this.value = mousePosition.scarecrowOne
        // if (this.current === 0) {
        //     this.value = mousePosition.scarecrowOne
        //     this.add()
        // } else {
        //     this.value = mousePosition.scarecrowTwo
        //     this.clear()
        // }
    },
    add: function () {
        this.current++;
    },
    clear: function () {
        this.current = 0;
    },
    do: function () {
        mouseClickHandle(this.value.x, this.value.y)
    }
}

async function touchNpc(log = true) {
    executeAction.setValue()
    executeAction.do()
    mouseClickHandle(mousePosition.talkOptionsFirst.x, mousePosition.talkOptionsFirst.y)
    await sleep(500)
    mouseClickHandle(mousePosition.talkOptionsSecond.x, mousePosition.talkOptionsSecond.y)
    if (log) logRecorder('npc task done,start plant task')
}
async function collectGoods(log = true) {
    let currentLand = executeAction.current
    let currentArea = mousePosition.collectAreaOne
    // let currentArea = currentLand === 0 ? mousePosition.collectAreaOne : mousePosition.collectAreaTwo
    for (let i = 0; i < currentArea.length; i++) {
        const areaPosition = currentArea[i];
        mouseClickHandle(areaPosition.x, areaPosition.y)
        await sleep(waitTime.collect)
        mouseClickHandle(mousePosition.goodsPick.x, mousePosition.goodsPick.y)
    }
    if (log) logRecorder('collect goods task done')
}

async function main() {
    try {
        logRecorder(`task start, current time: ${new Date().toLocaleString()}`)
        await sleep(waitTime.delayStart)
        logRecorder(`current num: ${num}`)
        touchNpc()
        await sleep(waitTime.grow)
        collectGoods()
        setTimeout(() => {
            num++;
            main()
        }, 2000);
    } catch (error) {
        logRecorder(error, true)
    }

}

main()