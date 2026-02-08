'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { PlaitPointerType, BoardTransforms, type PlaitBoard } from '@plait/core';
import { BoardCreationMode, setCreationMode, selectImage } from '@plait/common';
import { DrawTransforms } from '@plait/draw';
import {
  TOOL_TO_POINTER,
  DRAWING_TOOLS,
  DEFAULT_TOOL,
} from '@/shared/constants';
import type { BoardState, BoardContextValue, DrawingTool } from '@/shared/types';
import type { SaveStatus } from '@thinkix/storage';

type BoardContextValueTyped = BoardContextValue<PlaitBoard>;

const BoardContext = createContext<BoardContextValueTyped | null>(null);

interface BoardProviderProps {
  children: ReactNode;
}


export function BoardProvider({ children }: BoardProviderProps) {
  const [board, setBoard] = useState<PlaitBoard | null>(null);
  const [state, setState] = useState<BoardState>({
    activeTool: DEFAULT_TOOL,
    zoom: 100,
    currentBoardId: null,
    saveStatus: 'idle',
  });

  const boardRef = useRef<PlaitBoard | null>(null);
  boardRef.current = board;

  const setActiveTool = useCallback(
    (tool: DrawingTool) => {
      setState((prev) => ({ ...prev, activeTool: tool }));

      const currentBoard = boardRef.current;
      if (!currentBoard) return;

      if (tool === 'image') {
        selectImage(currentBoard, 400, (imageItem) => {
          DrawTransforms.insertImage(currentBoard, imageItem);
          setState((prev) => ({ ...prev, activeTool: DEFAULT_TOOL }));
          BoardTransforms.updatePointerType(currentBoard, PlaitPointerType.selection);
        });
        return;
      }

      const pointerType = TOOL_TO_POINTER[tool];
      BoardTransforms.updatePointerType(currentBoard, pointerType);

      if (DRAWING_TOOLS.has(tool)) {
        setCreationMode(currentBoard, BoardCreationMode.drawing);
      } else {
        setCreationMode(currentBoard, BoardCreationMode.dnd);
      }
    },
    []
  );

  const setCurrentBoardId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, currentBoardId: id }));
  }, []);

  const setSaveStatus = useCallback((status: SaveStatus) => {
    setState((prev) => ({ ...prev, saveStatus: status }));
  }, []);

  const value = useMemo<BoardContextValue>(
    () => ({
      board,
      setBoard,
      state,
      setState,
      setActiveTool,
      setCurrentBoardId,
      setSaveStatus,
    }),
    [board, state, setActiveTool, setCurrentBoardId, setSaveStatus]
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}


export function useBoardState(): BoardContextValueTyped {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardState must be used within BoardProvider');
  }
  return context;
}
