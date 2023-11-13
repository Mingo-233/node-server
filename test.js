const robot = require("robotjs");
const { sleep, logRecorder } = require('./utils')
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

async function logMousePosition(delay = 0) {
    await sleep(delay)
    let data = robot.getMousePos()
    console.log(data);
}


async function keyboard() {
    await sleep(1000)
    // robot.typeString("HelloWorld");

    // robot.keyTap("enter");
    robot.keyTap("f9");
}

// logMousePosition(1000)
keyboard()



// logRecorder(`task start, current time: ${new Date().toLocaleString()}`)