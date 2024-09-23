import { IProject } from "./projectData";
import { IKnifeData } from "./knifeData";
export interface ICreatePdfOptions {
  filePath: string;
  isOnlyKnife: boolean;
}
export type ICreatePageAppOptions = {
  unit: "mm";
  colorMode: "RGB";
} & ICreatePdfOptions;
