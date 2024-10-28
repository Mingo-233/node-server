interface IImgPathRecorder {
  remoteUrl: string;
  localUrl: string; // 第一次下载 缓存到本地的路径
  rgbUrl: string;
  alphaUrl?: string;
  cmykUrl: string;
}
//  根据remoteUrl 生成 localUrl

export interface IImgDescItem {
  format: "jpg" | "png";
  remoteUrl: string;
}

export type ISplitPngResult = Pick<
  IImgPathRecorder,
  "remoteUrl" | "alphaUrl" | "rgbUrl"
>;

export type ICmykConvertResult = Pick<
  IImgPathRecorder,
  "remoteUrl" | "cmykUrl"
>;
