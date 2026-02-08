import type { DrawingTool } from './tools';
import type { PlaitBoard } from '@plait/core';
import type { SaveStatus } from '@thinkix/storage';

export interface BoardState {
  activeTool: DrawingTool;
  zoom: number;
  currentBoardId: string | null;
  saveStatus: SaveStatus;
}

export interface BoardContextValue {
  board: PlaitBoard | null;
  setBoard: (board: PlaitBoard | null) => void;
  state: BoardState;
  setState: React.Dispatch<React.SetStateAction<BoardState>>;
  setActiveTool: (tool: DrawingTool) => void;
  setCurrentBoardId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
}
