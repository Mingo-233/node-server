const express = require('express')
const fs = require('fs')
const app = new express()
const port = 3123




app.use('/static/', express.static('./static/', {
    setHeaders: function (res, path, stat) {
        console.log(res);
        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
    }
}))

// app.get('/', function (req, res, next) {
//     fs.readFile('./index2.html', 'UTF-8', (err, data) => {
//         if (err) return
//         res.send(data)
//     })
// })
// 禁用缓存

app.listen(port, () => {
    console.log(`app is running at http://127.0.0.1:${port}/`)
})

