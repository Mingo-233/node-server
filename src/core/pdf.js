import SVGtoPDF from "svg-to-pdfkit";
import { getLayerKnifeData, getProjectsInfo } from "./store/index";
import { DPI } from "./helper";
import { useOpenType } from "./parseText";
const DPIV2 = 3.7795275591;
const PDFLayoutDPI = 2.834645669291339;
const layerKnife = getLayerKnifeData();
const MARGIN_SIDE = 30;
const MARGIN = MARGIN_SIDE * 2;
// *DPIV2的目的是，将mm转换为pt
const sizeWidth =
  (layerKnife.totalX + 2 * layerKnife.bleedline + MARGIN) * PDFLayoutDPI;
const sizeHeight =
  (layerKnife.totalY + 2 * layerKnife.bleedline + MARGIN) * PDFLayoutDPI;
console.log("sizeWidth", sizeWidth, "sizeHeight", sizeHeight);

export const useSvgPdf = (config) => {
  const { getSvg } = useOpenType();
  function painting(doc) {}

  function drawStartBefore(doc) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    console.log("pageWidth", pageWidth, "pageHeight", pageHeight);
    const translateX = MARGIN_SIDE * PDFLayoutDPI;
    const translateY = MARGIN_SIDE * PDFLayoutDPI;
    doc.translate(translateX, translateY);
  }
  async function drawEndBefore(doc) {
    const designDataList = getProjectsInfo().design_data.filter(
      (item) => item.type === "font"
    );
    const designLayer = document.querySelector("#design-layer");
    console.log("designDataList", designDataList);
    for (let i = 0; i < designDataList.length; i++) {
      const designData = designDataList[i];
      const textSvg = await getSvg(designData, {
        DPI: DPIV2,
        marginTop: 0,
        marginLeft: MARGIN_SIDE,
        bleedLineWidth: layerKnife.bleedline,
      });
      console.log("textSvg", textSvg);
      designLayer.appendChild(textSvg);
    }

    doc.addSVG(designLayer, 0, 0);

    const globalSvg = document.querySelector("#globalSvg");
    console.log("globalSvg", globalSvg);
    doc.addSVG(globalSvg, 0, 0);
  }
  function drawEnd(doc) {
    doc.end();
    console.log(doc.page.xobjects);
  }
  async function genPdf() {
    const doc = new PDFDocument({
      size: [sizeWidth, sizeHeight],
    });
    console.log("doc", doc);
    // 将其保存到 Blob 中
    const stream = doc.pipe(blobStream());

    PDFDocument.prototype.addSVG = function (svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, options), this;
    };
    drawStartBefore(doc);

    painting(doc);
    await drawEndBefore(doc);
    drawEnd(doc);
    // 当Blob流结束时，生成下载链接
    stream.on("finish", function () {
      const url = stream.toBlobURL("application/pdf");
      preview(url);
      // download(url)
    });
  }
  window.genPdf = genPdf;

  return { genPdf };
};

function preview(url) {
  const dom = document.querySelector("#preview-app");
  dom.src = url;
}
function download(url) {
  const link = document.createElement("a");
  link.href = url;
  const hashName = Math.random().toString(36).substring(7);
  link.download = hashName + ".pdf";
  link.textContent = "Download PDF";
  document.body.appendChild(link);
  link.click();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
