import PDFDocument from "pdfkit";
// import SVGtoPDF from "svg-to-pdfkit";
// import SVGtoPDF from "../../../public/svg-to-pdfkit-old";
import SVGtoPDF from "../../../public/svg-to-pdfkit.js";
import fs from "fs";
import { PDFLayoutDPI, PAGE_MARGIN } from "@/utils/constant";
import { setLang } from "@/utils/i18n.js";
import path from "path";
export function usePdfDoc(options) {
  const { pageSize, pageMargin, pageMarkerMargin, filePath, colorMode } =
    options;
  let doc = createPdfDocument(pageSize.width, pageSize.height);
  if (options?.lang === "zh-cn") {
    registerFont();
  }

  function createPdfDocument(sizeWidth: number, sizeHeight: number) {
    const docInstance = new PDFDocument({
      size: [sizeWidth, sizeHeight],
      info: {
        Producer: "Pacdora",
        Creator: "Pacdora",
      },
    });
    return docInstance;
  }
  function _onCreated() {
    PDFDocument.prototype.addSVG = function (svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, options);
    };
  }
  function _paintBefore() {
    doc.translate(pageMargin.left, pageMargin.top);
  }
  function SetPaintAnnotationLabelMargin() {
    doc.save();
    // 先位移回原始位置，在位移到标记位置
    doc.translate(0, -pageMargin.top + pageMarkerMargin.top);
    return doc.restore;
  }
  function addSVG(svg, x?, y?, options?) {
    const _options = {
      ...options,
      colorMode: colorMode,
    };
    // @ts-ignore
    doc.addSVG(svg, x, y, _options);
  }
  function _paintAfter() {}
  async function _paintEnd() {
    return new Promise<void>(async (resolve, reject) => {
      const randomName = Math.random().toString(36).substring(6);
      const days = new Date().getDate();
      const hours = new Date().getHours();
      const minutes = new Date().getMinutes();
      const fileName = `${days}-${hours}-${minutes}-${randomName}.pdf`;
      const outputPath = filePath || `./dist/output/${fileName}`;
      const writeStream = fs.createWriteStream(`${outputPath}`);
      writeStream.on("finish", () => {
        resolve();
      });
      writeStream.on("error", reject);
      await doc.pipe(writeStream);
      await doc.end();
    });
  }
  function addPage() {
    doc.addPage({
      size: [pageSize.width, pageSize.height],
    });
    _paintBefore();
  }
  function gotoPage(page: number) {
    doc.switchToPage(page);
  }
  function registerFont(fontFileName: string = "NotoSansCJK-Regular.ttf") {
    const cacheRootDir = path.resolve(__dirname, `../../../../../cache`);
    const fontPath = path.join(cacheRootDir, fontFileName);
    doc.registerFont("my-font", fontPath, "my-font-regular");
  }
  function init() {
    _onCreated();
    _paintBefore();
  }
  async function end() {
    _paintAfter();
    await _paintEnd();
  }

  return {
    doc,
    pdfInit: init,
    end,
    addSVG,
    addPage,
    gotoPage,
    SetPaintAnnotationLabelMargin,
  };
}
