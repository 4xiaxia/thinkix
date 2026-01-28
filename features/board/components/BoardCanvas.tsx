'use client';

import { useState, type ReactNode } from 'react';
import { Board, Wrapper, type BoardChangeData } from '@plait-board/react-board';
import {
  type PlaitElement,
  type PlaitBoardOptions,
  type PlaitPlugin,
  type PlaitBoard,
  type PlaitTheme,
  ThemeColorMode,
  withSelection,
  withHistory,
  withHotkey,
} from '@plait/core';
import { withGroup, withImage } from '@plait/common';
import { withDraw } from '@plait/draw';
import { withMind, MindThemeColors } from '@plait/mind';
import { withScribble } from '../plugins/scribble';
import { withImageHandle } from '../plugins/with-image-handle';
import { useBoardState } from '../hooks/use-board-state';

import '@/app/styles/plait-react-board.css';

export interface BoardCanvasProps {
  initialValue?: PlaitElement[];
  className?: string;
  children?: ReactNode;
}

const DEFAULT_BOARD_OPTIONS: PlaitBoardOptions = {
  readonly: false,
  hideScrollbar: false,
  disabledScrollOnNonFocus: false,
  themeColors: MindThemeColors,
};

const DEFAULT_THEME: PlaitTheme = {
  themeColorMode: ThemeColorMode.default,
};


export function BoardCanvas({
  initialValue = [],
  className,
  children,
}: BoardCanvasProps) {
  const { setBoard } = useBoardState();
  const [value, setValue] = useState<PlaitElement[]>(initialValue);

  const plugins: PlaitPlugin[] = [
    withSelection,     // Handle element selection
    withImage,         // Image rendering support
    withDraw,          // Drawing primitives
    withGroup,         // Grouping support
    withMind,          // Mind map support
    withHistory,       // Undo/redo
    withHotkey,        // Keyboard shortcuts
    withImageHandle,   // Enhanced image (drag-drop, paste, view)
    withScribble,      // Custom scribble/drawing plugin
  ];

  const handleChange = (data: BoardChangeData) => {
    setValue(data.children);
  };

  const handleBoardInit = (board: PlaitBoard) => {
    setBoard(board);
  };

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <Wrapper
        value={value}
        options={DEFAULT_BOARD_OPTIONS}
        plugins={plugins}
        theme={DEFAULT_THEME}
        onChange={handleChange}
      >
        <Board
          className="w-full h-full bg-background"
          afterInit={handleBoardInit}
        />
        {children}
      </Wrapper>
    </div>
  );
}
