export type Lang = "en-us" | "zh-cn";
type I18n = {
  [key in Lang]: {
    [key: string]: string;
  };
};
const i18n: I18n = {
  "en-us": {
    "Inside dimensions": "Inside dimensions",
    "Outside dimensions": "Outside dimensions",
    "Manufacture dimensions": "Manufacture dimensions",
    Material: "Material",
    Thickness: "Thickness",
    "Design area": "Design area",
    "Model ID": "Model ID",
    BLEED: "BLEED",
    TRIM: "TRIM",
    CREASE: "CREASE",
    Outer: "Outer",
    Inner: "Inner",
  },
  "zh-cn": {
    "Inside dimensions": "内尺寸(Inside dimensions)",
    "Outside dimensions": "外尺寸(Outside dimensions)",
    "Manufacture dimensions": "制造尺寸(Manufacture dimensions)",
    Material: "材质(Material)",
    Thickness: "厚度(Thickness)",
    "Design area": "展开面积(Design area)",
    "Model ID": "盒型编号(Model ID)",
    BLEED: "出血线",
    TRIM: "切割线",
    CREASE: "折叠线",
    Outer: "外侧面",
    Inner: "内侧面",
  },
};
const localeLanguage = {
  value: "en-us",
};
export function setLang(lang: Lang) {
  localeLanguage.value = lang;
}

export const $t = (key: string) => {
  return i18n[localeLanguage.value][key] || key;
};
