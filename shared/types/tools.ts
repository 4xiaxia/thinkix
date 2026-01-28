export type DrawingTool =
  | 'select'
  | 'hand'
  | 'mind'
  | 'draw'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'roundRectangle'
  | 'parallelogram'
  | 'trapezoid'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'cloud'
  | 'arrow'
  | 'text'
  | 'image';

export type ToolCategory = 'selection' | 'navigation' | 'drawing' | 'shapes' | 'other';

export interface ToolConfig {
  id: DrawingTool;
  category: ToolCategory;
  label: string;
  icon: React.ReactNode;
  pointerType: string;
  isDrawingTool: boolean;
}
