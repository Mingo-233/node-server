const axios = require("axios");
const { circularReference } = require("../utils/tools");
const inputHandler = require("../ioTxt");
axios.interceptors.request.use(
  (config) => {
    const aheaders = {
      cookie:
        // "_ga=GA1.2.817573689.1660366074; _tea_utm_cache_2608=undefined; __tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227131217957565122084%2522%252C%2522user_unique_id%2522%253A%25227131217957565122084%2522%252C%2522timestamp%2522%253A1660366074458%257D; passport_csrf_token=8bf1f097d295c60c8cc84d4662713cfb; passport_csrf_token_default=8bf1f097d295c60c8cc84d4662713cfb; n_mh=Kt07ecmmto2QqF7hHsSv6O-BST01Y0OAX3z6lbozBqk; sid_guard=4fa1bdb5613ead3916239cb6e87781b5%7C1660366085%7C31536000%7CSun%2C+13-Aug-2023+04%3A48%3A05+GMT; uid_tt=12add0925f3a740edf75382a1e1830e9; uid_tt_ss=12add0925f3a740edf75382a1e1830e9; sid_tt=4fa1bdb5613ead3916239cb6e87781b5; sessionid=4fa1bdb5613ead3916239cb6e87781b5; sessionid_ss=4fa1bdb5613ead3916239cb6e87781b5; sid_ucp_v1=1.0.0-KDVjMmZiYzM3YmI1ZGY2MzFhYzU3MzNjNmE1MWY0MzViMWM2YjRlZDEKFwiO4pHVqvTrBRCF2tyXBhiwFDgCQO8HGgJsZiIgNGZhMWJkYjU2MTNlYWQzOTE2MjM5Y2I2ZTg3NzgxYjU; ssid_ucp_v1=1.0.0-KDVjMmZiYzM3YmI1ZGY2MzFhYzU3MzNjNmE1MWY0MzViMWM2YjRlZDEKFwiO4pHVqvTrBRCF2tyXBhiwFDgCQO8HGgJsZiIgNGZhMWJkYjU2MTNlYWQzOTE2MjM5Y2I2ZTg3NzgxYjU; MONITOR_WEB_ID=ec040b3a-630d-43f8-804f-c287891371cb",
        "_ga=GA1.2.817573689.1660366074; _tea_utm_cache_2608=undefined; __tea_cookie_tokens_2608=%7B%22web_id%22%3A%227131217957565122084%22%2C%22user_unique_id%22%3A%227131217957565122084%22%2C%22timestamp%22%3A1660366074458%7D; passport_csrf_token=8bf1f097d295c60c8cc84d4662713cfb; passport_csrf_token_default=8bf1f097d295c60c8cc84d4662713cfb; MONITOR_WEB_ID=ec040b3a-630d-43f8-804f-c287891371cb; _gid=GA1.2.937817016.1661427764; _tea_utm_cache_2018=undefined; n_mh=f7IbdOePTc_oRm78V6KzkaK-t_o280ERqKS7el_5R6E; sid_guard=27fbbd7ad05a17df0a35186ea5921ad3|1661429047|31536000|Fri,+25-Aug-2023+12:04:07+GMT; uid_tt=cd5b03ccb424a2b52533dbcad1ee33af; uid_tt_ss=cd5b03ccb424a2b52533dbcad1ee33af; sid_tt=27fbbd7ad05a17df0a35186ea5921ad3; sessionid=27fbbd7ad05a17df0a35186ea5921ad3; sessionid_ss=27fbbd7ad05a17df0a35186ea5921ad3; sid_ucp_v1=1.0.0-KGYwYzc0NzYwNjM2OWU0NGIyODYyYjBkMDIwOTMzMGZjZjYyOWM0ZDQKFwjn3oD9to3pARC3yp2YBhiwFDgCQO8HGgJsZiIgMjdmYmJkN2FkMDVhMTdkZjBhMzUxODZlYTU5MjFhZDM; ssid_ucp_v1=1.0.0-KGYwYzc0NzYwNjM2OWU0NGIyODYyYjBkMDIwOTMzMGZjZjYyOWM0ZDQKFwjn3oD9to3pARC3yp2YBhiwFDgCQO8HGgJsZiIgMjdmYmJkN2FkMDVhMTdkZjBhMzUxODZlYTU5MjFhZDM",
    };
    // @ts-ignore
    Object.assign(config.headers, aheaders);
    return config;
  },
  (error) => {
    return error;
  }
);
const getBookList = () => {
  const url =
    "https://api.juejin.cn/booklet_api/v1/booklet/bookletshelflist?aid=2608&uuid=7131217957565122084&spider=0";
  axios
    .post(url)
    .then((response) => {
      // console.log(response);

      console.log(response.data);
      //   let content = JSON.stringify(response);

      inputHandler(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

const postSign = () => {
  const url =
    "https://api.juejin.cn/growth_api/v1/check_in?aid=2608&uuid=7131217957565122084&spider=0&_signature=_02B4Z6wo00101TetangAAIDBr8b9CPHTKKE3qW7AAC7v8ihQDke3NjDChM33tV0xnNbB4f9vyrOWcHwQ9mBTrm-.jB8t29Lq-JtRNHy5bnfkcau.iMc0tdXl5hB6lguMl3oml3GyfogXWNTFcd";

  axios
    .post(url)
    .then((response) => {
      // console.log(response);

      console.log(response.data);
      let content = circularReference(response);

      inputHandler(JSON.stringify(content));
      //   inputHandler(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

https: module.exports = {
  getBookListApi: getBookList,
  postSignApi: postSign,
};
