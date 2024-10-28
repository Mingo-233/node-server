const express = require("express");
const fs = require("fs");
const app = new express();
const port = 3123;
const pdf = require("./dist/src/root");
// 设置请求头 允许跨域
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// 中间件：解析 JSON 格式的请求体
app.use(express.json({ limit: "10mb" }));

app.post("/pdf", function (req, res, next) {
  console.log("pdf start -----");
  console.log(req.body);
  const { knife, project } = req.body;
  pdf.pdfMain(knife, project, {
    colorMode: "RGB",
  });
  console.log("pdf end ------");

  res.send("ok");
});

app.listen(port, () => {
  console.log(`app is running at http://127.0.0.1:${port}/`);
});
