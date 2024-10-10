import { IProject } from "./projectData";
import { IKnifeData } from "./knifeData";
export interface ICreatePdfOptions {
  filePath: string;
  isOnlyKnife: boolean;
  colorMode: "RGB" | "CMYK";
  knifeColor: {
    bleed?: string;
    fold?: string;
    cut?: string;
  };
}
export type ICreatePageAppOptions = {
  unit: "mm";
} & ICreatePdfOptions;
