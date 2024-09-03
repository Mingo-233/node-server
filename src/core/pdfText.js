// import opentype from "opentype.js";
export const useOpenType = () => {
  async function getSvg(fontInfo, config) {
    return new Promise((resolve, reject) => {
      const buffer = fetch(fontInfo.src).then((res) =>
        // const buffer = fetch("/HarmonyOS_Regular.ttf").then((res) =>
        res.arrayBuffer()
      );
      buffer.then((data) => {
        const decompressed = window.Module.decompress(data);
        const font = window.opentype.parse(decompressed);
        // const font = window.opentype.parse(data);
        const left = (fontInfo.style.left + config.bleedLineWidth) * config.DPI;
        const top = (fontInfo.style.top + config.bleedLineWidth) * config.DPI;
        const fontSize = fontInfo.style.fontSize;
        const {
          pathParts: paths,
          pathPartsTransform,
          pathPartsAlignTransform,
          position,
          svgSize,
          lineHeight,
          isVertical,
          domBoxSize,
          hasCnChar,
        } = window.getTextPaths(font, {
          // text: "你好哇",
          text: fontInfo.value,
          fontSize: fontSize,
          textAlign: fontInfo.style.textAlign,
          vertical: fontInfo.style.vertical,
          MaxWidth: fontInfo.style.width,
          MaxHeight: fontInfo.style.height,
        });

        const adobeAiTransform = `translate(${left}, ${top})`;
        const svgDom = window.genSvgCode(paths, {
          position,
          svgSize,
          lineHeight,
          isVertical,
          pathPartsTransform,
          pathPartsAlignTransform,
          domBoxSize,
          hasCnChar,
          adobeAiTransform,
          DPI: config.DPI,
        });

        resolve(svgDom);
      });
    });
  }
  return {
    getSvg,
  };
};
