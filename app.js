const { chromium } = require("playwright");

async function exportWebPageToPDF(url, outputPath) {
  // 启动浏览器
  const browser = await chromium.launch();

  try {
    // 创建新页面
    const page = await browser.newPage();

    // 导航到指定URL
    await page.goto(url, {
      waitUntil: "networkidle", // 等待网页加载完成
    });

    // 生成PDF
    await page.pdf({
      path: outputPath, // PDF保存路径
      format: "A4", // 页面格式
      margin: {
        // 页面边距
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true, // 打印背景图片
    });

    console.log(`PDF已保存到: ${outputPath}`);
  } catch (error) {
    console.error("导出PDF时发生错误:", error);
  } finally {
    // 关闭浏览器
    await browser.close();
  }
}

// 使用示例
exportWebPageToPDF("https://www.pacdora.com/", "./output.pdf");
