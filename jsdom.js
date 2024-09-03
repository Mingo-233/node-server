const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body><html>`);
const window = dom.window;
const document = dom.window.document;
main();

function main() {
  const fills = [
    {
      type: "fill",
      value: "rgb(18, 52, 86)",
      color: "#ad15e8",
      class: "circle",
    },
  ];
  let svgHTML = `

<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
<style>
.circle {
fill: #123456;
}

</style>

<circle class="circle" cx="50" cy="50" r="40"/>

</svg>
    `;
  let width = 100;
  let height = 100;
  let scale = 1;
  const dom = document.createElement("div");
  dom.innerHTML = svgHTML;
  const svgDom = dom.querySelector("svg");
  //   console.log("svgDom", svgDom);
  beautySvg(dom, window);
  let styleDom = dom.querySelector("style");
  if (!styleDom) {
    styleDom = window.document.createElement("style");
  }
  for (let i = 0; i < fills.length; i++) {
    const { type, value, color } = fills[i];
    const eles = getSvg(svgDom, type, value);
    // console.log("eles", eles);
    if (eles.length === 0) {
      styleDom.innerHTML += `.pac-${fills[i].class}{${type}:${color}}`;
      svgDom.classList.add(`pac-${fills[i].class}`);
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
  svgDom.setAttribute("width", `${width * scale}px`);
  svgDom.setAttribute("height", `${height * scale}px`);
  //   console.log("outer", dom.querySelector("svg").outerHTML);
  //   const svg = svg64(dom.querySelector("svg").outerHTML);
  //   this.image.src = svg;
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
  const result = [];
  for (let m = 0; m < ele.length; m++) {
    const i = ele[m];
    if (["defs", "style", "title"].includes(i.nodeName)) {
      continue;
    }
    console.log("元素", i);
    console.log("i.getAttribute(type)", i.getAttribute(type), type, value);
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
    const colorNew = [];
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
