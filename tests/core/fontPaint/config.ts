export const defaultTransformParams = {
  style: {
    left: 0,
    top: 0,
  },
  bleedLineWidth: 3,
  color: "#ff0000",
  colorMode: "rgb",
  unit: "mm",
} as any;

export function fsSaveFile(context, name = "test.svg") {
  const fs = require("fs");
  const path = require("path");
  const pwdPath = process.cwd();
  const filePath = path.resolve(pwdPath, "./output");
  fs.writeFileSync(`${filePath}/${name}`, context);
  console.log("file saved");
}
