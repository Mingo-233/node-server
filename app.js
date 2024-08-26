const express = require('express')
const app = new express()
const port = 3123

const useQueue = require('./useQueue')
const { addTask, processTasks } = useQueue()

const MIN_TIME_50 = 50 * 60 * 1000
const MAX_TIME_110 = 110 * 60 * 1000

// const MIN_TIME_50 = 6 * 1000
// const MAX_TIME_110 = 30 * 1000
function notifyBark(minute, hour = 0) {
    const msg = `你的停车时间已经超过${hour}小时${minute}分钟`
    const icon = `https://day.app/assets/images/avatar.jpg`
    fetch(`https://api.day.app/vVEfUA68tfzDjNgADBMVZ6/${msg}?icon=${icon}`)
}
function request() {
    console.log('mock request');
}
app.get('/notify', function (req, res, next) {
    const task = async () => {
        await sleep(MIN_TIME_50)
        notifyBark(50)
    }

    const task2 = async () => {
        await sleep(MAX_TIME_110)
        notifyBark(50, 1)
    }
    addTask(task)
    addTask(task2)
    processTasks()

    res.status(200).send({
        code: 200,
        status: 'success',
        date: new Date()
    })
})

app.listen(port, () => {
    console.log(`app is running at http://127.0.0.1:${port}/`)
})

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
