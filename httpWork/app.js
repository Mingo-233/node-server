const express = require("express");
const fs = require("fs");
const app = new express();
const port = 3000;
const axios = require("axios");

// https://www.baoxiaohe.com/api/design/search/popular
const sleepFun = (time) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, time);
  });
};

axios
  .get("https://www.baoxiaohe.com/api/design/search/popular")
  .then((response) => {
    console.log(response);

    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log(`app is running at http://127.0.0.1:${port}/`);
});
