// imageMagick的脚本命令在spawn中调用

// spawn(command, args, options): 这是 await-spawn 的主要函数。

// command: 要执行的命令。
// args: 命令的参数，作为数组传递。
// options: 可选参数，类似于 child_process.spawn 的选项。

// example: const result = await spawn('ls', ['-lh', '/usr']);

const commandMap = {
  //   ls -la
  test: ["ls", "-la"],
  // convert input.png -alpha extract -colorspace Gray output_alpha.jpg
  splitAlpha: ["convert", "-alpha extract -colorspace Gray"],
  // convert input.png -alpha off output_rgb.jpg
  // splitRGB: ["convert", "-alpha off"],
  splitRGB: ["convert", "-background white -flatten"],
  //convert input.png -profile sRGB2014.icc -profile ./cmyk-adobe-japan-2001-coated.icc -negate cmyk-img-f.jpg
  convertCMYK: [
    "convert",
    "-profile ./dist/pdf-core/public/sRGB2014.icc -profile ./dist/pdf-core/public/cmyk-adobe-japan-2001-coated.icc -negate",
  ],
};

export function magickCMD(
  name: keyof typeof commandMap,
  input: string,
  output: string
) {
  const [cmd, arg] = commandMap[name];
  const args = input && output ? `${input} ${arg} ${output}` : arg;
  const argsArr = args.split(" ");
  return [cmd, argsArr];
}
