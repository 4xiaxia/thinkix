import { DEFAULT_COLOR, Point, ThemeColorMode } from '@plait/core';
import { PlaitCustomGeometry } from '@plait/draw';

export const ScribbleColorPalette = {
  [ThemeColorMode.default]: {
    stroke: DEFAULT_COLOR,
    fill: '#FFFFFF',
  },
  [ThemeColorMode.colorful]: {
    stroke: '#06ADBF',
    fill: '#CDEFF2',
  },
  [ThemeColorMode.soft]: {
    stroke: '#6D89C1',
    fill: '#DADFEB',
  },
  [ThemeColorMode.retro]: {
    stroke: '#E9C358',
    fill: '#F6EDCF',
  },
  [ThemeColorMode.dark]: {
    stroke: '#FFFFFF',
    fill: '#434343',
  },
  [ThemeColorMode.starry]: {
    stroke: '#42ABE5',
    fill: '#163F5A',
  },
};

export enum ScribbleTool {
  eraser = 'eraser',
  ink = 'ink',
  marker = 'marker',
  brush = 'brush',
  highlighter = 'highlighter',
}

export const SCRIBBLE_ELEMENT_TYPE = 'scribble';

export type ScribbleElement = PlaitCustomGeometry<
  typeof SCRIBBLE_ELEMENT_TYPE,
  Point[],
  ScribbleTool
>;

export const ScribbleElement = {
  isScribble: (value: unknown): value is ScribbleElement => {
    return (value as ScribbleElement)?.type === SCRIBBLE_ELEMENT_TYPE;
  },
};
