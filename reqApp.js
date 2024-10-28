const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

// 指定静态文件夹
const staticFolderPath = path.join(__dirname, "assets");

// 使用 express.static 中间件提供静态文件
app.use(express.static(staticFolderPath));

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行，访问地址：http://localhost:${port}`);
});
