const express = require('express')
const fs = require('fs')
const QRCode = require('qrcode')
// let host ='http://127.0.0.1'
let host = 'http://10.0.13.144'

const app = new express()
const port = 3123

let payUrl = `https://openapi.alipay.com/gateway.do?`

app.use('/static/', express.static('./static/'))
app.get('/', function (req, res, next) {
    res.send('hello world')
    // fs.readFile('./index2.html', 'UTF-8', (err, data) => {
    //     if (err) return
    //     res.send(data)
    // })
})
app.get('/code', function (req, res, next) {
    console.log('11');
    QRCode.toDataURL(`${host}:3123/start-pay`, function (err, url) {
        console.log(url)
        res.send(url)
    })
})
app.get('/start-pay', function (req, res, next) {
    res.redirect(payUrl)
})


app.listen(port, '0.0.0.0', () => {
    console.log(`app is running at http://127.0.0.1:${port}/`)
})

