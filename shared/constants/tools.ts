import { PlaitPointerType } from '@plait/core';
import type { DrawingTool, ToolCategory } from '@/shared/types/tools';

export const TOOL_TO_POINTER: Record<DrawingTool, string> = {
  hand: PlaitPointerType.hand,
  select: PlaitPointerType.selection,

  mind: 'mind',
  draw: 'ink', // Scribble/freehand drawing

  // Shapes
  rectangle: 'rectangle',
  ellipse: 'ellipse',
  diamond: 'diamond',
  triangle: 'triangle',
  roundRectangle: 'roundRectangle',
  parallelogram: 'parallelogram',
  trapezoid: 'trapezoid',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  octagon: 'octagon',
  star: 'star',
  cloud: 'cloud',

  // Other
  arrow: 'straight',
  text: 'text',
  image: 'image',
};

export const DRAWING_TOOLS: Set<DrawingTool> = new Set([
  'draw',
  'rectangle',
  'ellipse',
  'diamond',
  'triangle',
  'roundRectangle',
  'parallelogram',
  'trapezoid',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'cloud',
  'arrow',
  'mind',
]);

export const SELECTION_TOOLS: DrawingTool[] = ['select'];
export const NAVIGATION_TOOLS: DrawingTool[] = ['hand'];
export const DRAWING_TOOLS_LIST: DrawingTool[] = ['draw', 'mind'];
export const SHAPE_TOOLS: DrawingTool[] = [
  'rectangle',
  'ellipse',
  'diamond',
  'triangle',
  'roundRectangle',
  'parallelogram',
  'trapezoid',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'cloud',
  'arrow',
];
export const OTHER_TOOLS: DrawingTool[] = ['text', 'image'];

export const DEFAULT_TOOL: DrawingTool = 'select';
