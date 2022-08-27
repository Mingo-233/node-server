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

file = path.resolve(__dirname, `log/log-1.json`);
// fs.access(file, fs.constants.F_OK, (err) => {
//   console.log(`${file} ${err ? "does not exist" : "exists"}`);
// });

isExists(file)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
