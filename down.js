const fs = require('fs');
const https = require('https');

// 定义要下载的URL数组
const arr = [
    "https://cdn.pacdora.com/ui/cursor/lt.svg",
    "https://cdn.pacdora.com/ui/cursor/ct.svg",
    "https://cdn.pacdora.com/ui/cursor/rt.svg",
    "https://cdn.pacdora.com/ui/cursor/rc.svg",
    "https://cdn.pacdora.com/ui/cursor/rb.svg",
    "https://cdn.pacdora.com/ui/cursor/cb.svg",
    "https://cdn.pacdora.com/ui/cursor/lb.svg",
    "https://cdn.pacdora.com/ui/cursor/lc.svg",
    "https://cdn.pacdora.com/ui/cursor/rotate.png",
    "https://cdn.pacdora.com/ui/cursor/move.svg",
    "https://cdn.pacdora.com/ui/success-tick.svg",
    "https://cdn.pacdora.com/ui/warn.svg",
    "https://cdn.pacdora.com/ui/fresh.svg",
    "https://cdn.pacdora.com/hdr/b9f66e36-632a-4686-a4da-bfafe7604154.hdr",
    "https://cdn.pacdora.com/ui/transparent.jpeg",
    "https://cdn.pacdora.com/materials/flute-side.jpeg",
    "https://cdn.pacdora.com/ui/assets/flute.jpeg",
    "https://cdn.pacdora.com/ui/assets/watermark.png",
    "https://cdn.pacdora.com/ui/editor/outside-preview.webp",
    "https://cdn.pacdora.com/ui/editor/inside-preview.webp",
    "https://cdn.pacdora.com/ui/export-success.gif",
    "https://cdn.pacdora.com/ui/export-progress.gif",
    "https://cdn.pacdora.com/ui/warn-tip.svg",
    "https://cdn.pacdora.com/ui/success-tip.svg",
    "https://cdn.pacdora.com/ui/assets/drag.png",
    "https://cdn.pacdora.com/ui/placeholder-1.svg",
    "https://cdn.pacdora.com/ui/assets/model_cover.svg",
    "https://cdn.pacdora.com/ui/pricing/pricing-bg-mobile.png",
    "https://cdn.pacdora.com/ui/pricing/pricing-bg.png",
    "https://cdn.pacdora.com/ui/empty-new.svg",
    "https://cdn.pacdora.com/ui/assets/material_flute.jpeg",
    "https://cdn.pacdora.com/ui/home/Index-Mockup2.1.webp",
    "https://cdn.pacdora.com/ui/home/Index-Dieline.webp",
    "https://cdn.pacdora.com/ui/home/Index-Render2.1.webp",
    "https://cdn.pacdora.com/ui/home/Folding-box2.1.webp",
    "https://cdn.pacdora.com/ui/home/Pouch2.1.webp",
    "https://cdn.pacdora.com/ui/home/Bottle2.1.webp",
    "https://cdn.pacdora.com/ui/home/Tube2.1.webp",
    "https://cdn.pacdora.com/ui/home/Can2.1.webp",
    "https://cdn.pacdora.com/ui/home/Cup-Container2.1.webp",
    "https://cdn.pacdora.com/ui/home/Paper-Bag2.1.webp",
    "https://cdn.pacdora.com/ui/home/Jar2.1.webp",
    "https://cdn.pacdora.com/ui/home/1-Folding-Box.webp",
    "https://cdn.pacdora.com/ui/home/2-Tuck-End-Box.webp",
    "https://cdn.pacdora.com/ui/home/3-Tuck-End-Box-Variations.webp",
    "https://cdn.pacdora.com/ui/home/4-Boxes-with-Lid.webp",
    "https://cdn.pacdora.com/ui/home/5-Display-Box.webp",
    "https://cdn.pacdora.com/ui/home/6-Paper-Bag.webp",
    "https://cdn.pacdora.com/ui/home/7-Polygonal-Box.webp",
    "https://cdn.pacdora.com/ui/home/8-Tray-Box.webp",
    "https://cdn.pacdora.com/ui/home/9-Storage-Box.webp",
    "https://cdn.pacdora.com/ui/home/10-Triangle-Box.webp",
    "https://cdn.pacdora.com/ui/home/11-Envelope.webp",
    "https://cdn.pacdora.com/ui/home/12-Tag.webp",
];
const fontArr = [
    "https://cdn.pacdora.com/font/webFonts/AvenirNextDemi/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextDemi/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextThin/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextThin/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextMedium/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextMedium/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextBoldItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextBoldItalic/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextDemiItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextDemiItalic/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextHeavyItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextHeavyItalic/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextBold/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextBold/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextMediumItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextMediumItalic/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextRegular/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextRegular/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextHeavy/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextHeavy/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextThinItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextThinItalic/font.woff",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextItalic/font.woff2",
    "https://cdn.pacdora.com/font/webFonts/AvenirNextItalic/font.woff",
]
const downloadFolder = './downloads'; // 指定下载文件夹路径

// 创建下载文件夹（如果不存在）
if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
}

// 定义下载函数
function downloadFile(url) {
    const fileName = url.split('/').pop();
    const fontName = extractFontName(url);
    const fileDirName = `${downloadFolder}/font/${fontName}`;
    const filePath = `${downloadFolder}/font/${fontName}/${fileName}`;
    // const filePath = `${downloadFolder}/${fileName}`;
    if (!fs.existsSync(fileDirName)) {
        fs.mkdirSync(fileDirName);
    }

    const fileStream = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`下载完成：${fileName}`);
        });
    }).on('error', (err) => {
        console.error(`下载失败：${err.message}`);
    });
}

function extractFontName(url) {
    // 使用正则表达式来匹配URL中的字体名称部分
    const match = url.match(/\/([^/]+)\/font\.(woff|woff2)$/);

    if (match && match[1]) {
        return match[1];
    } else {
        return null; // 如果未找到匹配，则返回null或者你认为合适的值
    }
}



// 遍历数组并下载文件
// for (const url of arr) {
//     downloadFile(url);
// }
for (const url of fontArr) {
    downloadFile(url);
}