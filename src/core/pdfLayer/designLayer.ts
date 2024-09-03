import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createElement } from "@/nodes/index";
const mockUrl =
  "//test-cdn.pacdora.com/user-materials-mockup_mockup/a5d4fdf2-8545-4f2d-95ea-6049f7bcf1e1.png";
export function drawImgElement(knifeData) {
  const imgSvg = createElement("svg", { xmlns: "http://www.w3.org/2000/svg" }, [
    createElement("image", {
      "xlink:href": mockUrl,
    }),
  ]);

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "img",
    svgString: imgSvg,
  };
  return context;
}
