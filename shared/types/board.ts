import type { DrawingTool } from './tools';
import type { PlaitBoard } from '@plait/core';

export interface BoardState {
  activeTool: DrawingTool;
  zoom: number;
}

export interface BoardContextValue {
  board: PlaitBoard | null;
  setBoard: (board: PlaitBoard | null) => void;
  state: BoardState;
  setState: React.Dispatch<React.SetStateAction<BoardState>>;
  setActiveTool: (tool: DrawingTool) => void;
}
