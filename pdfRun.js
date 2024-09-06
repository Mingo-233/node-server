const PDFDocument = require("pdfkit");
const fs = require("fs");
// const SVGtoPDF = require("svg-to-pdfkit");
const SVGtoPDF = require("./public/svg-to-pdfkit");
const path = require("path");
const https = require("https");
// const { fileURLToPath } = require("url");

// import PDFDocument from "pdfkit";
// import fs from "fs";
// import SVGtoPDF from "svg-to-pdfkit";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url); // 转换为文件路径
// const __dirname = path.dirname(__filename); // 获取目录名

// const fontPath = path.join(__dirname, "./fonts/font.woff2");

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options);
};

// const doc = new PDFDocument();
const weakMap = new Map();
async function main() {
  const imgSrc =
    // "https://test-cdn.pacdora.com/user-materials-mockup_mockup/a8de08d6-f297-48f0-ab2e-c384f2c13e92.png";
    "https://test-cdn.pacdora.com/symbol-icon/afd66cab-e3c1-410e-8393-0e42f8c2cd9f.svg";
  // const imgBuffer = await fetchImageAsBase64(imgSrc);
  const imgBuffer = await getSvgContent(imgSrc);
  console.log("imgBuffer", imgBuffer);
  // weakMap.set(imgSrc, imgBuffer);

  // const imgSvg = `
  //   <svg xmlns="http://www.w3.org/2000/svg" transform="translate(302.026, 85.25)">
  //    <image xlink:href='${imgSrc}' width="31.5512" height="31.5512"/>
  //   </svg>
  // `;
  // doc.addSVG(imgSvg, 0, 0, {
  //   imageCallback: function (link) {
  //     // return fetchImage(imgSrc);
  //     return weakMap.get(link);
  //   },
  // });

  // end();
}

function end() {
  const randomName = Math.random().toString(36).substring(7);
  doc.pipe(fs.createWriteStream(`./output/${randomName}.pdf`));
  doc.end();
}
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      })
      .on("error", (err) => reject(err));
  });
}
function getSvgContent(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        // Check for successful response
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to get SVG. Status code: ${res.statusCode}`)
          );
        }

        // Accumulate response data
        res.on("data", (chunk) => {
          data += chunk;
        });

        // Resolve with complete data
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}
function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = [];

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

// function nodeWrite(svg) {
//   const randomName = Math.random().toString(36).substring(7);
//   fs.writeFileSync(`./${randomName}.svg`, svg);
// }
main();
