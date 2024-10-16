const http = require("http");
const fs = require("fs");
const path = require("path");

const imageFilePath = path.join(__dirname, "svgExample.png"); // 修改为你的图片文件名

const server = http.createServer((req, res) => {
  // 只对特定请求路径响应
  if (req.url === "/svgExample.png") {
    // 读取图片文件
    fs.readFile(imageFilePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
        return;
      }

      // 设置5秒延迟
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(data);
      }, 21000);
    });
  } else {
    // 如果请求不是图片，返回404
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
