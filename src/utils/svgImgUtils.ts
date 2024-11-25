import { fitColor, hexToCMYK, rgbToCmykByIcc } from "./color";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
export function getTransformSvg(svgString, fillsConfig = [], options) {
  //   const fillsConfig = [
  //     {
  //       type: "fill",
  //       value: "#FFFFFF",
  //       color: "#ad15e8",
  //       class: "abc",
  //     },
  //   ];
  const jsDom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body></body><html>`
  );
  const window = jsDom.window;
  const document = jsDom.window.document;

  const dom = document.createElement("div");
  dom.innerHTML = svgString;
  const svgDom = dom.querySelector("svg");
  const classNameList = beautySvg(dom, window) || [];
  let styleDom = dom.querySelector("style");
  if (!styleDom) {
    styleDom = window.document.createElement("style");
  }
  let isInvalidFillsConfig = false;
  const _fillsConfig = filterFillsConfig(fillsConfig);
  for (let i = 0; i < _fillsConfig.length; i++) {
    const configItem: any = _fillsConfig[i];
    const { type, value } = configItem;
    let { color } = configItem;
    if (color === value && configItem.class === "globalFill") {
      isInvalidFillsConfig = true;
    }
    if (color === "NONE" || color === "none") color = "rgba(0,0,0,0)";

    let renderColor = fitColor(color, options.colorMode);

    const eles: any = getSvg(svgDom, type, value);
    if (eles.length === 0) {
      // styleDom.innerHTML += `.pac-${configItem.class}{${type}:${color}}`;
      // svgDom.classList.add(`pac-${configItem.class}`);
      svgDom.style.setProperty(type, renderColor);
    } else {
      eles.forEach((vo) => {
        if (vo.type === "attr") {
          vo.el.setAttribute(type, renderColor);
        } else {
          vo.el.style[type] = renderColor;
        }
      });
    }
  }

  svgDom.appendChild(styleDom);
  svgDom.setAttribute("width", `100%`);
  svgDom.setAttribute("height", `100%`);
  svgDom.setAttribute("preserveAspectRatio", "none");
  if (options.transform) {
    svgDom.setAttribute("transform", options.transform);
  }
  let resultSvgString = dom.querySelector("svg")?.outerHTML ?? "";
  resultSvgString = addUniqueClass(resultSvgString, classNameList);
  return resultSvgString;

  // if (isInvalidFillsConfig) {
  //   return resultSvgString;
  // } else {
  //   // 在svg-to-pdfkit中 样式的优先级按出现的先后顺序决定，和浏览器中的权重规则不一样
  //   return removeStyleTags(resultSvgString);

  //   // 先把style标签里面所有颜色设置都添加到行内，然后把style标签里面的颜色设置都删除
  //   return filterSvg(resultSvgString);
  // }
}
function beautySvg(svgDom, win) {
  const classNameSet = new Set();
  const styleDom = svgDom.querySelector("style");
  if (!styleDom) return;
  const tempStyle = win.document.createElement("style");
  tempStyle.innerHTML = styleDom.innerHTML;
  win.document.head.appendChild(tempStyle);
  for (const sheet of win.document.styleSheets) {
    const rules = sheet.cssRules;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const selectorTextArr = rule.selectorText.split(",");
      selectorTextArr.forEach((selectorText) => {
        classNameSet.add(selectorText.slice(1));
      });
      const ruleDoms = svgDom.querySelectorAll(rule.selectorText);
      if (ruleDoms) {
        for (let k = 0; k < ruleDoms.length; k++) {
          ["fill", "stroke"].forEach((type) => {
            ruleDoms[k].style[type] = rule.style.getPropertyValue(type);
          });
        }
      }
    }
  }
  return Array.from(classNameSet);
}
// 给svgString中的class添加唯一id，防止样式冲突
function addUniqueClass(svgString, classNameList) {
  const uniqueId = Math.random().toString(36).substring(2, 6);
  // 创建一个 Map 来存储原始类名和新类名的映射
  const classNameMap = new Map();

  // 首先创建所有类名的映射
  classNameList.forEach((className) => {
    classNameMap.set(className, `${className}-${uniqueId}`);
  });

  // 只执行一次替换，使用映射表中的新类名
  classNameMap.forEach((newClassName, originalClassName) => {
    // 替换 class="className" 的情况
    svgString = svgString.replace(
      new RegExp(`class="${originalClassName}"`, "g"),
      `class="${newClassName}"`
    );

    // 替换 CSS 选择器 .className 的情况
    svgString = svgString.replace(
      new RegExp(`\\.${originalClassName}(?![\\w-])`, "g"),
      `.${newClassName}`
    );
  });
  return svgString;
}
function beautySvgV2(svgDom, win) {
  const styleDom = svgDom.querySelector("style");
  if (!styleDom) return;
  const tempStyle = win.document.createElement("style");
  tempStyle.innerHTML = styleDom.innerHTML;

  win.document.head.appendChild(tempStyle);
  for (const sheet of win.document.styleSheets) {
    const rules = sheet.cssRules;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const selectorTextArr = rule.selectorText.split(",");
      console.log("selectorTextArr", selectorTextArr);
      selectorTextArr.forEach((selectorText) => {
        const ruleDoms = svgDom.querySelectorAll(selectorText);
        if (ruleDoms) {
          for (let k = 0; k < ruleDoms.length; k++) {
            ["fill", "stroke"].forEach((type) => {
              const value = rule.style.getPropertyValue(type);
              if (value && value.length > 3) ruleDoms[k].style[type] = value;
            });
          }
        }
      });
    }
  }
}

function getSvg(dom, type, value) {
  const ele = dom.querySelectorAll("*");
  const result: any = [];
  for (let m = 0; m < ele.length; m++) {
    const i = ele[m];
    if (["defs", "style", "title"].includes(i.nodeName)) {
      continue;
    }
    if (i.getAttribute(type) && colorEqual(i.getAttribute(type) ?? "", value)) {
      result.push({ el: i, type: "attr" });
      continue;
    }
    const style = i.style;
    if (
      value !== "NONE" &&
      value !== "none" &&
      colorEqual(style.getPropertyValue(type) ?? "", value)
    ) {
      result.push({ el: i, type: "style" });
    }
  }
  return result;
}

function hexToRGB(val) {
  if (!val) return { r: 0, g: 0, b: 0, a: 0 };
  let color = val.toLowerCase().trim();
  const pattern = /^#([0-9|a-f]{3}|[0-9|a-f]{6}|[0-9|a-f]{4}|[0-9|a-f]{8})$/;
  const rgbPattern = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  const rgbaPattern =
    /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  if (color && pattern.test(color)) {
    const isOp = color.length === 5 || color.length === 9;
    let op = 1;
    if (color.length === 5) {
      op = parseInt(`0x${color[4]}${color[4]}`) / 255;
      color = color.substr(0, color.length - 1);
    } else if (color.length === 9) {
      op = parseInt(`0x${color[7]}${color[8]}`) / 255;
      color = color.substr(0, color.length - 2);
    }
    if (color.length == 4) {
      // 将三位转换为六位
      color =
        "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    //处理六位的颜色值
    const colorNew: any = [];
    for (let i = 1; i < 7; i += 2) {
      colorNew.push(parseInt("0x" + color.slice(i, i + 2)));
    }
    return {
      r: colorNew[0],
      g: colorNew[1],
      b: colorNew[2],
      a: isOp ? op : 1,
    };
  } else if (rgbPattern.test(color)) {
    const matched = color.match(rgbPattern);
    return {
      r: Number(matched[1]) % 256,
      g: Number(matched[2]) % 256,
      b: Number(matched[3]) % 256,
      a: 1,
    };
  } else if (rgbaPattern.test(color)) {
    const matched = color.match(rgbaPattern);
    return {
      r: Number(matched[1]) % 256,
      g: Number(matched[2]) % 256,
      b: Number(matched[3]) % 256,
      a: Number(matched[4]),
    };
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}
function colorEqual(c1, c2) {
  const c1Rgba = hexToRGB(c1);
  const c2Rgba = hexToRGB(c2);
  return (
    c1Rgba.r === c2Rgba.r &&
    c1Rgba.g === c2Rgba.g &&
    c1Rgba.b === c2Rgba.b &&
    c1Rgba.a === c2Rgba.a
  );
}
function filterSvg(input) {
  return processSVG(input).replace("px", "");
}
function processSVG(svgString) {
  // 步骤1: 提取<style></style>中的内容
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const match = svgString.match(styleRegex);

  if (match && match[1]) {
    // 步骤2: 删除fill和stroke的赋值
    let styleContent = match[1];
    styleContent = styleContent.replace(/\bfill:\s*#[0-9A-Fa-f]+;\s*/g, "");
    // url后面的内容都移除 fill:url(任何值)
    styleContent = styleContent.replace(
      /\bfill:\s*url\(\s*[\s\S]*?\);\s*/g,
      ""
    );
    styleContent = styleContent.replace(/\bstroke:\s*#[0-9A-Fa-f]+;\s*/g, "");

    // 步骤3: 将处理后的内容塞回原字符串
    svgString = svgString.replace(styleRegex, `<style>${styleContent}</style>`);
  }

  return svgString;
}
function removeStyleTags(input) {
  return input.replace(/<style[\s\S]*?<\/style>/gi, "").replace("px", "");
}

function replaceHexColor(input) {
  let svgString = input.replace(
    /(?<=(fill|stroke|stop-color)=["']|(?:fill|stroke|stop-color):\s*)\s*#[0-9a-fA-F]{3,6}/gi,
    (match) => {
      let convertedColor = hexToCMYK(match);
      return convertedColor;
    }
  );
  return svgString;
}

function replaceRGBColor(input) {
  let svgString = input.replace(/rgb\(\d+,\d+,\d+\)/g, (match) => {
    const rgbValues = match.match(/\d+/g).map(Number);
    let convertedColor = rgbToCmykByIcc(
      rgbValues[0],
      rgbValues[1],
      rgbValues[2]
    );
    return convertedColor;
  });
  return svgString;
}
function pipe(...fns) {
  return (input) => fns.reduce((acc, fn) => fn(acc), input);
}

export const svgCmykHandle = pipe(replaceHexColor, replaceRGBColor);

function filterFillsConfig(fillsConfig) {
  return fillsConfig.filter((vo) => !vo.color.startsWith("url"));
}
