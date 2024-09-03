export type IHtmlNode = {
  tagName: string;
  props: INodeProps;
  children: IHtmlNode[] | string;
};
export type INodeProps = Record<string, string>;
export type INodeChildren = IHtmlNode[] | string[] | string;
