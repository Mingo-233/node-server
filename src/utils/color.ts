export function hexToCMYK(hex) {
  // 去掉 '#' 符号
  hex = hex.replace(/^#/, "");

  // 将十六进制转换为 RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // 计算 K 值
  let k = 1 - Math.max(r, g, b);
  if (k === 1) {
    const result = { c: 0, m: 0, y: 0, k: 1 };
    return `cmyk(${result.c}, ${result.m}, ${result.y}, ${result.k})`;
  }

  // 计算 C, M, Y 值
  let c = (1 - r - k) / (1 - k);
  let m = (1 - g - k) / (1 - k);
  let y = (1 - b - k) / (1 - k);

  const result = {
    c: parseFloat((c * 100).toFixed(1)),
    m: parseFloat((m * 100).toFixed(1)),
    y: parseFloat((y * 100).toFixed(1)),
    k: parseFloat((k * 100).toFixed(1)),
  };
  return `cmyk(${result.c}, ${result.m}, ${result.y}, ${result.k})`;
}

function rgbToCmyk(r, g, b) {
  // 转换 RGB 到 [0, 1] 范围
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;

  // 计算 K 值
  let k = Math.min(c, m, y);

  // 避免分母为 0
  if (k === 1) {
    c = 0;
    m = 0;
    y = 0;
  } else {
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
  }

  // 返回 CMYK 值，四舍五入到两位小数
  const result = {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
  return `cmyk(${result.c}%, ${result.m}%, ${result.y}%, ${result.k}%)`;
}
