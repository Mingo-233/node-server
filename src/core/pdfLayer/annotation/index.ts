import jsdom from "jsdom";
export function createSvgTable(params, options?) {
  const jsDom = new jsdom.JSDOM(
    `<!DOCTYPE html><html><head></head><body></body><html>`
  );
  const document = jsDom.window.document;
  const { rows, cols, cellWidth, cellHeight, textArray, transform } = params;
  const defaultOption = {
    fontSize: 14,
    fontFamily: "Arial",
    textColor: "#000",
    xOffset: 10,
    yOffset: 15,
    lineStartOffset: 100, // 线条起始偏移位置
    lineLength: 70, // 线条长度
    lineArray: [],
    type: "text",
  };
  const _option = Object.assign(defaultOption, options);
  const {
    fontSize,
    fontFamily,
    textColor,
    xOffset,
    yOffset,
    lineStartOffset,
    lineLength,
    lineArray,
    type,
  } = _option;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  if (type === "text") {
    let svgWidth = cols * cellWidth;
    let svgHeight = rows * cellHeight;
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("width", svgWidth);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const textIndex = i * cols + j;
        const textContent = textArray[textIndex] || "";
        const x = j * cellWidth + xOffset;
        const y = i * cellHeight + yOffset;
        const textElement = document.createElementNS(svgNS, "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y);
        textElement.setAttribute("font-size", fontSize);
        textElement.setAttribute("font-family", fontFamily);
        textElement.setAttribute("fill", textColor);
        textElement.textContent = textContent;

        svg.appendChild(textElement);
      }
    }
  } else if (type === "line") {
    let svgWidth = lineStartOffset + lineLength + 20;
    let svgHeight = rows * cellHeight;
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("width", svgWidth);
    for (let i = 0; i < rows; i++) {
      const y = i * cellHeight + yOffset;

      // 添加文字
      const textContent = textArray[i] || "";
      const textElement = document.createElementNS(svgNS, "text");
      textElement.setAttribute("x", xOffset);
      textElement.setAttribute("y", y);
      textElement.setAttribute("font-size", fontSize);
      textElement.setAttribute("font-family", fontFamily);
      textElement.setAttribute("fill", textColor);
      textElement.textContent = textContent;
      svg.appendChild(textElement);

      // 添加线条
      const lineOptions = lineArray[i] || {};
      const lineColor = lineOptions.color || "#000";
      const lineWidth = lineOptions.width || 2;
      const lineElement = document.createElementNS(svgNS, "line");
      lineElement.setAttribute("x1", lineStartOffset);
      lineElement.setAttribute("y1", y - fontSize / 2);
      lineElement.setAttribute("x2", lineStartOffset + lineLength);
      lineElement.setAttribute("y2", y - fontSize / 2);
      lineElement.setAttribute("stroke", lineColor);
      lineElement.setAttribute("stroke-width", lineWidth);
      svg.appendChild(lineElement);
    }
  }

  return svg.outerHTML || "";
}
