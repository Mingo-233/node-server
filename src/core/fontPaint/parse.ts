import { isSymbolChar } from "./utils";
import { getVerticalTextPaths } from "./parse_zh";
import { parseTextV2 } from "./parse_en_v2";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";

export function parseText(
  fontApp,
  config: IFontParseParams,
  defaultFontApp?
): IFontParse {
  if (config.vertical && isSymbolChar(config.text)) {
    return getVerticalTextPaths(fontApp, config, defaultFontApp);
  } else {
    return parseTextV2(fontApp, config, defaultFontApp);
  }
}

// function hasCnWords(str) {
//   return /[\u4e00-\u9fa5]/.test(str);
// }
