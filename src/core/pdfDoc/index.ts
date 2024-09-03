import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import fs from "fs";
import { PDFLayoutDPI, PAGE_MARGIN } from "@/utils/constant";
import { IDrawingBoardConfig } from "@/utils/index";
export function usePdfDoc(boardConfig: IDrawingBoardConfig) {
  let doc = createPdfDocument(
    boardConfig.pageSize.width,
    boardConfig.pageSize.height
  );

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
    doc.translate(boardConfig.pageMargin.left, boardConfig.pageMargin.top);
  }

  function addSVG(svg: string) {
    // @ts-ignore
    doc.addSVG(svg);
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
      size: [boardConfig.pageSize.width, boardConfig.pageSize.height],
    });
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
