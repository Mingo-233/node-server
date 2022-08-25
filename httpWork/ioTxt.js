const fs = require("fs");

const path = require("path");

const inputHandle = (content) => {
  // const content = fs.readFileSync("./src/template.jsx");
  //   let content = "teset22d\n";

  let info = {};

  let n = 1;

  fs.rmdirSync("./log", { recursive: true, force: true });

  fs.mkdirSync("./log");

  //   info[n] = "testcontent1";

  //   info[2] = "testcontent2";

  //   for (const key in info) {
  //     console.log(info[key]);

  //     content += info[key] + "\n";
  //   }

  const filePath = path.resolve(__dirname, `log/log.json`);
  // const filePath2 = path.resolve(__dirname, `log/log.txt`);
  console.log(filePath);
  console.log("日志信息已记录");
  fs.writeFileSync(filePath, content);
  // fs.writeFileSync(filePath2, content);
};

module.exports = inputHandle;
