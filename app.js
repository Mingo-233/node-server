const express = require('express')
const https = require('https')
const app = new express()
const port = 3123

const useQueue = require('./useQueue')
const { addTask, processTasks, clearTasks, getQueueStatus } = useQueue()

const MIN_TIME_50 = 50 * 60 * 1000  // 50分钟
const HOUR_TIME = 60 * 60 * 1000    // 1小时
const MAX_NOTIFY_COUNT = 4          // 最大通知次数
const BARK_URL = 'https://api.day.app/vVEfUA68tfzDjNgADBMVZ6/'

// 通知计数器
let notifyCount = 0

function notifyBark(minute, hour = 0, count) {
    try {
        const msg = `你的停车时间已经超过${hour}小时${minute}分钟 (第${count}/${MAX_NOTIFY_COUNT}次提醒)`
        const icon = `https://day.app/assets/images/avatar.jpg`
        https.get(`${BARK_URL}${encodeURIComponent(msg)}?icon=${encodeURIComponent(icon)}`, (res) => {
            console.log(`第${count}次通知发送成功，状态码:`, res.statusCode)
        }).on('error', (err) => {
            console.error(`第${count}次发送通知失败:`, err.message)
        })
    } catch (error) {
        console.error('notifyBark 函数错误:', error.message)
    }
}

// 创建递归通知任务
function createNotifyTask(isFirst = true) {
    return async () => {
        try {
            // 等待指定时间
            if (isFirst) {
                await sleep(MIN_TIME_50)  // 第一次等待50分钟
            } else {
                await sleep(HOUR_TIME)    // 之后每次等待1小时
            }
            
            // 增加计数器
            notifyCount++
            
            // 计算总时间
            const totalMinutes = isFirst ? 50 : 50 + (notifyCount - 1) * 60
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            
            // 发送通知
            notifyBark(minutes, hours, notifyCount)
            
            // 检查是否需要继续通知
            if (notifyCount < MAX_NOTIFY_COUNT) {
                console.log(`已发送第${notifyCount}次通知，将在1小时后发送第${notifyCount + 1}次通知`)
                // 添加下一次通知任务
                addTask(createNotifyTask(false))
                processTasks()
            } else {
                console.log(`已达到最大通知次数(${MAX_NOTIFY_COUNT}次)，停止通知`)
                // 清空所有任务
                clearTasks()
                // 重置计数器
                notifyCount = 0
            }
        } catch (error) {
            console.error('通知任务执行失败:', error.message)
        }
    }
}

async function notifyMock() {
    return new Promise((resolve, reject) => {
        try {
            const icon = `https://day.app/assets/images/avatar.jpg`
            const req = https.get(`${BARK_URL}park_server_check?icon=${encodeURIComponent(icon)}`, (res) => {
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage
                })
            })
            
            req.on('error', (err) => {
                console.error('Mock通知请求失败:', err.message)
                reject(err)
            })
            
            req.setTimeout(10000, () => {
                req.destroy()
                reject(new Error('请求超时'))
            })
        } catch (error) {
            reject(error)
        }
    })
}

app.use(express.static('static'))

// 允许跨域
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error('应用错误:', err.stack)
    res.status(500).send({
        code: 500,
        status: 'error',
        message: '服务器内部错误',
        date: new Date()
    })
})

app.get('/notify', function (req, res, next) {
    try {
        // 先清空现有任务和重置计数器
        clearTasks()
        notifyCount = 0
        
        console.log('开始新的停车通知任务')
        
        // 添加第一个通知任务
        addTask(createNotifyTask(true))
        processTasks()

        res.status(200).send({
            code: 200,
            status: 'success',
            message: `停车通知任务已启动，将在50分钟后发送第一次通知，之后每小时一次，最多通知${MAX_NOTIFY_COUNT}次`,
            data: {
                maxNotifyCount: MAX_NOTIFY_COUNT,
                firstNotifyTime: '50分钟后',
                intervalTime: '1小时'
            },
            date: new Date()
        })
    } catch (error) {
        next(error)
    }
})

// 新增清空重置接口
app.get('/clear', function (req, res, next) {
    try {
        const queueStatus = getQueueStatus()
        const clearedTasks = queueStatus.tasksCount
        
        // 清空所有任务
        clearTasks()
        // 重置计数器
        notifyCount = 0
        
        console.log(`用户手动清空任务，已清除${clearedTasks}个任务，计数器已重置`)

        res.status(200).send({
            code: 200,
            status: 'success',
            message: '所有通知任务已清空，计数器已重置',
            data: {
                clearedTasksCount: clearedTasks,
                currentNotifyCount: notifyCount
            },
            date: new Date()
        })
    } catch (error) {
        next(error)
    }
})

// 新增状态查询接口
app.get('/status', function (req, res, next) {
    try {
        const queueStatus = getQueueStatus()
        
        res.status(200).send({
            code: 200,
            status: 'success',
            message: '获取状态成功',
            data: {
                currentNotifyCount: notifyCount,
                maxNotifyCount: MAX_NOTIFY_COUNT,
                remainingNotifyCount: Math.max(0, MAX_NOTIFY_COUNT - notifyCount),
                queueStatus: queueStatus
            },
            date: new Date()
        })
    } catch (error) {
        next(error)
    }
})

app.get('/mock', async function (req, res, next) {
    try {
        const notifyRes = await notifyMock()
        console.log('Mock通知响应:', notifyRes)
        
        if (notifyRes.statusCode === 200) {
            res.status(200).send({
                code: 200,
                status: 'success',
                message: 'Mock通知发送成功',
                date: new Date()
            })
        } else {
            res.status(500).send({
                code: 500,
                status: 'error',
                message: `Mock通知失败，状态码: ${notifyRes.statusCode}`,
                date: new Date()
            })
        }
    } catch (error) {
        console.error('Mock接口错误:', error.message)
        res.status(500).send({
            code: 500,
            status: 'error',
            message: error.message,
            date: new Date()
        })
    }
})

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err)
    console.error('服务器即将退出...')
    process.exit(1)
})

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason)
    console.error('在Promise:', promise)
})

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在优雅关闭...')
    process.exit(0)
})

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在优雅关闭...')
    process.exit(0)
})

app.listen(port, () => {
    console.log(`应用正在运行: http://127.0.0.1:${port}/`)
    console.log('进程ID:', process.pid)
})

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
