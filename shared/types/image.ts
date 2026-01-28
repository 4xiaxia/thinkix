export type DataURL = `data:${string};base64,${string}`;

export interface ImageItem {
  url: DataURL | string;
  width: number;
  height: number;
}
