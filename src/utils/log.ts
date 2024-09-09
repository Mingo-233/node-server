const isDebug = process.argv.includes("--debug");
const colorStyle = {
  white: "\x1b[37m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  redBg: "\x1b[41m",
  reset: "\x1b[0m",
};
function definedLog() {
  function logMsg(color) {
    return (...msg) =>
      console.log(`${color}${msg[0]}${colorStyle.reset}`, ...msg.slice(1));
  }
  return {
    info: logMsg(colorStyle.purple),
    success: logMsg(colorStyle.green),
    error: logMsg(colorStyle.red),
    warn: logMsg(colorStyle.yellow),
    debug: (...arg) => {
      if (isDebug) {
        console.log(...arg);
      }
    },
  };
}

const log = definedLog();
export default log;
