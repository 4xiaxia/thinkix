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
import type { PlaitBoard } from '@plait/core';
import { PlaitPointerType, BoardTransforms } from '@plait/core';
import { BoardCreationMode, setCreationMode, selectImage } from '@plait/common';
import { insertImage } from '@plait/draw';
import {
  TOOL_TO_POINTER,
  DRAWING_TOOLS,
  DEFAULT_TOOL,
} from '@/shared/constants';
import type { BoardState, BoardContextValue, DrawingTool } from '@/shared/types';

const BoardContext = createContext<BoardContextValue | null>(null);

interface BoardProviderProps {
  children: ReactNode;
}

/**
 * Provider for board state and tool management
 * Handles tool selection, pointer type updates, and board interactions
 */
export function BoardProvider({ children }: BoardProviderProps) {
  const [board, setBoard] = useState<PlaitBoard | null>(null);
  const [state, setState] = useState<BoardState>({
    activeTool: DEFAULT_TOOL,
    zoom: 100,
  });

  // Use ref to avoid stale closures in callbacks
  const boardRef = useRef<PlaitBoard | null>(null);
  boardRef.current = board;

  const setActiveTool = useCallback(
    (tool: DrawingTool) => {
      setState((prev) => ({ ...prev, activeTool: tool }));

      const currentBoard = boardRef.current;
      if (!currentBoard) return;

      // Special handling for image tool - trigger file picker
      if (tool === 'image') {
        selectImage(currentBoard, 400, (imageItem) => {
          insertImage(currentBoard, imageItem);
          setState((prev) => ({ ...prev, activeTool: DEFAULT_TOOL }));
          BoardTransforms.updatePointerType(currentBoard, PlaitPointerType.selection);
        });
        return;
      }

      // Update pointer type
      const pointerType = TOOL_TO_POINTER[tool];
      BoardTransforms.updatePointerType(currentBoard, pointerType);

      // Set creation mode for drawing tools
      if (DRAWING_TOOLS.has(tool)) {
        setCreationMode(currentBoard, BoardCreationMode.drawing);
      } else {
        setCreationMode(currentBoard, BoardCreationMode.dnd);
      }
    },
    [] // Dependencies are managed via ref
  );

  const value = useMemo<BoardContextValue>(
    () => ({
      board,
      setBoard,
      state,
      setState,
      setActiveTool,
    }),
    [board, state, setActiveTool]
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

/**
 * Hook to access board state and controls
 * Must be used within BoardProvider
 */
export function useBoardState(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardState must be used within BoardProvider');
  }
  return context;
}
