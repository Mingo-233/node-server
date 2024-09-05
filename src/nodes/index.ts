import type { IHtmlNode, INodeProps, INodeChildren } from "@/type/node";
export function createElement(
  tagName: string,
  attributes: INodeProps = {},
  children: INodeChildren = []
) {
  // 开始标签
  let element = `<${tagName}`;

  // 添加属性
  for (const [key, value] of Object.entries(attributes)) {
    if (!value) continue;
    element += ` ${key}="${value}"`;
  }

  element += `>`; // 结束标签的开始部分

  // 添加子元素或文本内容
  for (const child of children) {
    if (typeof child === "string") {
      // 如果是文本内容，直接添加
      element += child;
    } else {
      // 如果是子元素（对象），递归调用 createElement
      element += createElement(child.tagName, child.props, child.children);
    }
  }

  // 添加结束标签
  element += `</${tagName}>`;

  return element;
}

// const svgString = createElement(
//   "svg",
//   { xmlns: "http://www.w3.org/2000/svg", width: "100", height: "100" },
//   [
//     createElement("circle", {
//       cx: "50",
//       cy: "50",
//       r: "40",
//       stroke: "black",
//       "stroke-width": "3",
//       fill: "red",
//     }),
//   ]
// );

// console.log(svgString);

export function createSvgElement(
  rootProps: INodeProps = {},
  children: INodeChildren
) {
  return createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", version: "1.1", ...rootProps },
    children
  );
}

export function createKnifeSvgElement(
  rootProps: {
    width: number;
    height: number;
    unit: string;
  },
  children: INodeChildren
) {
  return createSvgElement(
    {
      x: "0",
      y: "0",
      width: rootProps.width + rootProps.unit,
      height: rootProps.height + rootProps.unit,
      overflow: "visible",
      viewBox: `0 0 ${rootProps.width} ${rootProps.height}`,
    },
    children
  );
}

export function createAnnotationSvgElement() {}
