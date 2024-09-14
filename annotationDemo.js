function createSvgTable(
  rows,
  cols,
  cellWidth,
  cellHeight,
  textArray,
  options = {}
) {
  const {
    fontSize = 16,
    fontFamily = "Arial",
    textColor = "#000",
    xOffset = 10,
    yOffset = 20,
    lineStartOffset = 100, // 线条起始偏移位置
    lineLength = 70, // 线条长度
    lineArray = [],
    type = "text",
  } = options;

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
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("transform", "translate(500,0)");
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

  return svg;
}

function getAnnotation() {
  //   使用例子：
  const rows = 5;
  const cols = 2;
  const cellWidth = 240;
  const cellHeight = 30;
  const textArray = [
    "Inside dimensions",
    "120(L)x60(W)x160.5(H) mm",
    "Outside dimensions",
    "121(L)x61(W)x162.5(H) mm",
    "Manufacture dimensions",
    "120.6(L)x60.6(W)x161.6(H) mm",
    "Material",
    "White card board",
    "Thickness",
    "0.5mm",
  ];

  var svgTextTable = createSvgTable(
    rows,
    cols,
    cellWidth,
    cellHeight,
    textArray
  );
  var svgTextTableV2 = createSvgTable(2, 2, cellWidth, cellHeight, [
    "Design Area",
    "375.5mm X 309mm",
    "Dieline ID",
    "100010",
  ]);

  const rowsLine = 3;
  const cellWidthLine = 100; // 这个在这里没有使用到，但可以作为参考
  const cellHeightLine = 30;
  const lineArray = [
    { color: "green", width: 5 },
    { color: "blue", width: 5 },
    { color: "red", width: 5 },
  ];

  var svgLineTable = createSvgTable(
    rowsLine,
    null,
    cellWidthLine,
    cellHeightLine,
    ["BLEED", "TRIM", "CREASE"],
    {
      type: "line",
      lineArray: lineArray,
    }
  );
  return {
    svgTextTable,
    svgLineTable,
    svgTextTableV2,
  };
}
