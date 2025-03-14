const { chromium, firefox, webkit } = require("playwright");

async function getBrowserVersions() {
  // 查看 Chromium 版本
  const chromeVersion = await chromium.launch();
  console.log("Chromium 版本:", await chromeVersion.version());
  await chromeVersion.close();

  // 查看 Firefox 版本
  const firefoxVersion = await firefox.launch();
  console.log("Firefox 版本:", await firefoxVersion.version());
  await firefoxVersion.close();

  // 查看 WebKit 版本
  const webkitVersion = await webkit.launch();
  console.log("WebKit 版本:", await webkitVersion.version());
  await webkitVersion.close();
}

getBrowserVersions().catch(console.error);
