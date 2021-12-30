const express = require('express')
const fs = require('fs')
const app = new express()
const port = 3000
app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*')
    // res.setHeader('Content-Type', 'application/json;charset=utf-8')
    // res.setHeader("Access-Control-Allow-Headers", "Content-Type,Key");
    // res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')

    if (!res.getHeader('Cache-Control') || !res.getHeader('Expires')) {
        res.setHeader("Cache-Control", "public, max-age=345600"); // ex. 4 days in seconds. 
        res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString()); // in ms. 
        console.log(res);
    }
    next()
})
const sleepFun = time => {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, time)
    })
}

const filter = (req, res, next) => {
    const { sleep } = req.query || 0
    if (sleep) {
        sleepFun(sleep).then(() => next())
    } else {
        next()
    }
}

app.use(filter)

app.use('/static/', express.static('./static/'))

app.get('/', function (req, res, next) {

    fs.readFile('./index.html', 'UTF-8', (err, data) => {
        if (err) return
        res.send(data)
    })
})

app.listen(port, () => {
    console.log(`app is running at http://127.0.0.1:${port}/`)
})

