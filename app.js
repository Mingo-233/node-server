
const sirv = require('sirv');
const serve = sirv('client', {
    dev: true, // 开发模式下启用更详细的日志
});
let askTaskResolve = null
const server = require('http').createServer(async (req, res) => {
    // 自定义路由
    if (req.url === '/getToken') {
        const token = await getClientToken()
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            code: 200,
            data: token
        }));
    } else {
        // 处理静态资源请求
        serve(req, res);
    }
});

const io = require('socket.io')(server);
io.on('connection', client => {
    console.log('connection', client.id);
    client.on('receiveToken', token => {
        console.log('receiveToken', token);
        askTaskResolve && askTaskResolve(token)
        askTaskResolve = null
    });

});


io.on('disconnect', () => {
    console.log('disconnect',);
});

function getClientToken() {
    io.emit('askToken');
    return new Promise((resolve, reject) => {
        askTaskResolve = resolve
    });
}


server.listen(3000);
console.log('Server running at http://localhost:3000/');