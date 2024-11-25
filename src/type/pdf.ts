import { IProject } from "./projectData";
import { IKnifeData } from "./knifeData";
import { Lang } from "@/utils/i18n";
export interface ICreatePdfOptions {
  filePath: string;
  isOnlyKnife: boolean;
  colorMode: "RGB" | "CMYK";
  knifeColor: {
    bleed?: string;
    fold?: string;
    cut?: string;
  };
  lang?: Lang;
  annotationUnit: "mm" | "in";
}
export type ICreatePageAppOptions = {
  unit: "mm";
} & ICreatePdfOptions;
