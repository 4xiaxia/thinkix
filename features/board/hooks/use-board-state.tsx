'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
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
import type { BoardState, BoardContextValue, DrawingTool } from '@thinkix/shared';
import type { SaveStatus } from '@thinkix/storage';
import { LaserPointer } from '../utils/laser-pointer';

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
  const laserPointerRef = useRef<LaserPointer | null>(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const setActiveTool = useCallback(
    (tool: DrawingTool) => {
      setState((prev) => ({ ...prev, activeTool: tool }));

      const currentBoard = boardRef.current;
      if (!currentBoard) return;

      if (laserPointerRef.current) {
        laserPointerRef.current.destroy();
        laserPointerRef.current = null;
      }

      if (tool === 'image') {
        selectImage(currentBoard, 400, (imageItem) => {
          DrawTransforms.insertImage(currentBoard, imageItem);
          setState((prev) => ({ ...prev, activeTool: DEFAULT_TOOL }));
          BoardTransforms.updatePointerType(currentBoard, PlaitPointerType.selection);
        });
        return;
      }

      if (tool === 'laser') {
        BoardTransforms.updatePointerType(currentBoard, PlaitPointerType.hand);
        setCreationMode(currentBoard, BoardCreationMode.dnd);
        laserPointerRef.current = new LaserPointer();
        laserPointerRef.current.init(currentBoard);
        return;
      }

      if (tool === 'eraser') {
        BoardTransforms.updatePointerType(currentBoard, 'eraser');
        setCreationMode(currentBoard, BoardCreationMode.drawing);
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
