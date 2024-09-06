import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import fs from "fs";
import { PDFLayoutDPI, PAGE_MARGIN } from "@/utils/constant";
export function usePdfDoc(pageSize, pageMargin) {
  let doc = createPdfDocument(pageSize.width, pageSize.height);

  function createPdfDocument(sizeWidth: number, sizeHeight: number) {
    console.log("sizeWidth", sizeWidth);

    const docInstance = new PDFDocument({
      size: [sizeWidth, sizeHeight],
    });
    return docInstance;
  }
  function _onCreated() {
    PDFDocument.prototype.addSVG = function (svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, options);
    };
    console.log("_onCreated is called");
  }
  function _paintBefore() {
    doc.translate(pageMargin.left, pageMargin.top);
  }

  function addSVG(svg, x?, y?, options?) {
    // @ts-ignore
    doc.addSVG(svg, x, y, options);
  }
  function _paintAfter() {}
  function _paintEnd() {
    const randomName = Math.random().toString(36).substring(4);
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const fileName = `${hours}-${minutes}-${randomName}.pdf`;
    doc.pipe(fs.createWriteStream(`./output/${fileName}`));
    // doc.pipe(fs.createWriteStream(`dist/pdf/${randomName}.pdf`));
    doc.end();
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
  function init() {
    _onCreated();
    _paintBefore();
  }
  function end() {
    _paintAfter();
    _paintEnd();
  }

  return {
    pdfInit: init,
    end,
    addSVG,
    addPage,
    gotoPage,
  };
}
