const { chromium } = require("playwright");
const cookieConfig = [
  {
    name: "c_secure_uid",
    value: "MjkwMTM%3D",
  },
  {
    name: "c_secure_tracker_ssl",
    value: "eWVhaA%3D%3D",
  },
  {
    name: "c_secure_ssl",
    value: "eWVhaA%3D%3D",
  },
  {
    name: "c_secure_pass",
    value: "dd3d2e5f08004107fbdc5dff42452aa2",
  },
  {
    name: "c_secure_login",
    value: "bm9wZQ%3D%3D",
  },
];
const defaultConfig = {
  domain: "www.icc2022.com",
  path: "/",
  expires: 1769066959,
  httpOnly: true,
};

const _rebaseConfig = cookieConfig.map((item) => ({
  ...defaultConfig,
  ...item,
}));
async function openWebPage(url) {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: true, // 确保无头模式
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // 适应CI环境
  });

  try {
    // 创建新页面
    const page = await browser.newPage();
    await page.context().addCookies(_rebaseConfig);

    await page.goto(url, {
      waitUntil: "networkidle", // 等待网页加载完成
    });
    console.log(`当前时间: ${new Date().toISOString()}`);
    console.log(`打开网页: ${url}`);
    try {
      await page.waitForSelector(".fc-day-mon", { timeout: 5000 });
      console.log("页面成功加载，找到预期元素");
    } catch (error) {
      console.error("未能找到预期元素，页面可能未正确加载");
    }

    // await page.screenshot({ path: "page-loaded.png" });
  } catch (error) {
    console.error("打开网页时发生错误:", error);
    await browser.close();
    process.exit(1);
  } finally {
    // 关闭浏览器
    setTimeout(() => {
      browser.close();
    }, 3000);
  }
}

// 使用示例
openWebPage("https://www.icc2022.com/attendance.php");
