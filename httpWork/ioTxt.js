const fs = require("fs");

const path = require("path");

const isExists = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      // if (err) console.log(`${file} ${err ? "does not exist" : "exists"}`);s
      if (!err) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
};

let n = 1;
const inputHandle = async (content) => {
  // const content = fs.readFileSync("./src/template.jsx");
  //   let content = "teset22d\n";

  if ((n = 1)) {
    fs.rmdirSync("./log", { recursive: true, force: true });
    fs.mkdirSync("./log");
  }

  //   info[n] = "testcontent1";

  //   info[2] = "testcontent2";

  //   for (const key in info) {
  //     console.log(info[key]);

  //     content += info[key] + "\n";
  //   }
  let fileName = `log-${n}.json`;
  let is = await isExists(path.resolve(__dirname, `log/${fileName}`));
  console.log(is);
  if (is) {
    n = n + 1;
    fileName = `log-${n}.json`;
    console.log(n);
  }
  // const filePath = path.resolve(__dirname, `log/log.json`);
  const filePath = path.resolve(__dirname, `log/${fileName}`);
  // const filePath2 = path.resolve(__dirname, `log/log.txt`);
  console.log(filePath);
  console.log("日志信息已记录");
  fs.writeFileSync(filePath, content);
  // fs.writeFileSync(filePath2, content);
};

module.exports = inputHandle;
