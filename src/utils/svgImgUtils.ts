const jsdom = require("jsdom");
const { JSDOM } = jsdom;
export function getTransformSvg(svgString, fillsConfig = []) {
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
  //   let width = 100;
  //   let height = 100;
  const dom = document.createElement("div");
  dom.innerHTML = svgString;
  const svgDom = dom.querySelector("svg");
  beautySvg(dom, window);
  let styleDom = dom.querySelector("style");
  if (!styleDom) {
    styleDom = window.document.createElement("style");
  }
  for (let i = 0; i < fillsConfig.length; i++) {
    const configItem: any = fillsConfig[i];
    const { type, value, color } = configItem;
    const eles: any = getSvg(svgDom, type, value);
    if (eles.length === 0) {
      styleDom.innerHTML += `.pac-${configItem.class}{${type}:${color}}`;
      svgDom.classList.add(`pac-${configItem.class}`);
    } else {
      eles.forEach((vo) => {
        if (vo.type === "attr") {
          vo.el.setAttribute(type, color);
        } else {
          vo.el.style[type] = color;
        }
      });
    }
  }
  svgDom.appendChild(styleDom);
  svgDom.setAttribute("width", `100%`);
  svgDom.setAttribute("height", `100%`);
  let resultSvgString = dom.querySelector("svg")?.outerHTML ?? "";
  return removeStyleTags(resultSvgString);
}

function beautySvg(svgDom, win) {
  const styleDom = svgDom.querySelector("style");
  if (!styleDom) return;
  const tempStyle = win.document.createElement("style");
  tempStyle.innerHTML = styleDom.innerHTML;
  win.document.head.appendChild(tempStyle);
  for (const sheet of win.document.styleSheets) {
    const rules = sheet.cssRules;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const ruleDoms = svgDom.querySelectorAll(rule.selectorText);
      if (ruleDoms) {
        for (let k = 0; k < ruleDoms.length; k++) {
          ["fill", "stroke"].forEach((type) => {
            ruleDoms[k].style[type] = rule.style.getPropertyValue(type);
            console.log("ruleDoms", ruleDoms);
          });
        }
      }
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
    // console.log("elem", i, i.style);
    if (colorEqual(style.getPropertyValue(type) ?? "", value)) {
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
function removeStyleTags(input) {
  return input.replace(/<style[\s\S]*?<\/style>/gi, "");
}
