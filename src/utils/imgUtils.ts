const https = require("https");
const path = require("path");

export const imgMap = new Map();

export function clearImgMap() {
  imgMap.clear();
}
export function fetchImage(url, isBuffer = true) {
  return new Promise((resolve, reject) => {
    const _url = prefixUrl(url);
    https
      .get(_url, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(
              `Failed to get fetch Image. Status code: ${res.statusCode}`
            )
          );
        }
        const chunks: any = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          if (isBuffer) {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
          } else {
            resolve(chunks.join(""));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}
function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data: any = [];

        // 累积数据
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        // 请求结束时处理数据
        res.on("end", () => {
          const buffer = Buffer.concat(data);
          // 判断图片类型并添加对应的 base64 前缀
          const ext = path.extname(url).toLowerCase();
          let mimeType;

          if (ext === ".png") {
            mimeType = "image/png";
          } else if (ext === ".jpg" || ext === ".jpeg") {
            mimeType = "image/jpeg";
          } else if (ext === ".gif") {
            mimeType = "image/gif";
          } else {
            reject(new Error("Unsupported image format"));
            return;
          }

          const base64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
          resolve(base64);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function prefixUrl(url) {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}
export function isSvgUrl(url) {
  return url.toLowerCase().endsWith(".svg");
}
