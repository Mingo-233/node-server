const express = require("express");
const fs = require("fs");
const app = new express();
const port = 3000;
const Interval = require("./utils/node-schedule");
const schedule = require("node-schedule");
const { postSignApi, luckDrawApi } = require("./api/juejinApi");

const sleepFun = (time) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, time);
  });
};

let a = new Interval({
  unit_name: "自动分发任务 0 0 12 * * *",
  maintain_time: "10 * * * * *",
  //   last_alarm: "自动分发任务 0 0 12 * * *",
});
// a.create(async () => {
//   // 写入你自己想在定时任务触发的时候，想要执行的函数
//   console.log("aaaa");
//   postSignApi();
// });
console.log(a.findAll());
// app.get("/", function (req, res, next) {
//   fs.readFile("./index2.html", "UTF-8", (err, data) => {
//     if (err) return;
//     res.send(data);
//   });
// });

let rule = new schedule.RecurrenceRule();
rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次

// 启动任务
let job = schedule.scheduleJob(rule, () => {
  console.log(a.findAll());
  //   console.log("签到执行");
  //   postSignApi();
  console.log("抽奖执行");
  luckDrawApi;
});
app.listen(port, () => {
  console.log(`app is running at http://127.0.0.1:${port}/`);
});
