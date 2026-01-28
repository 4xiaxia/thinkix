'use client';

import { useState } from 'react';
import { Board, Wrapper, BoardChangeData } from '@plait-board/react-board';
import {
  PlaitElement,
  PlaitBoardOptions,
  PlaitPlugin,
  PlaitBoard,
  PlaitTheme,
  ThemeColorMode,
  withSelection,
  withHistory,
  withHotkey,
} from '@plait/core';
import { withGroup, withImage } from '@plait/common';
import { withDraw } from '@plait/draw';
import { withMind, MindThemeColors } from '@plait/mind';
import { withScribble, ScribbleTool } from './scribble';

import { ThinkixProvider, useThinkix } from './hooks/use-thinkix';
import { ThinkixToolbar } from './ThinkixToolbar';

import '@/app/styles/plait-react-board.css';

interface ThinkixBoardProps {
  initialValue?: PlaitElement[];
  className?: string;
}

function ThinkixBoardInner({ initialValue = [], className }: ThinkixBoardProps) {
  const { setBoard } = useThinkix();
  const [value, setValue] = useState<PlaitElement[]>(initialValue);

  const options: PlaitBoardOptions = {
    readonly: false,
    hideScrollbar: false,
    disabledScrollOnNonFocus: false,
    themeColors: MindThemeColors,
  };

  const plugins: PlaitPlugin[] = [
    withSelection,
    withImage,
    withDraw,
    withGroup,
    withMind,
    withHistory,
    withHotkey,
    withScribble, // Custom scribble/drawing plugin
  ];

  const theme: PlaitTheme = {
    themeColorMode: ThemeColorMode.default,
  };

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
        options={options}
        plugins={plugins}
        theme={theme}
        onChange={handleChange}
      >
        <Board
          className="w-full h-full bg-background"
          afterInit={handleBoardInit}
        />
        <ThinkixToolbar />
      </Wrapper>
    </div>
  );
}

export function ThinkixBoard(props: ThinkixBoardProps) {
  return (
    <ThinkixProvider>
      <ThinkixBoardInner {...props} />
    </ThinkixProvider>
  );
}
