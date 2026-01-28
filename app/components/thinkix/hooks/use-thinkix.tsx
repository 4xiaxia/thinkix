'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { PlaitBoard, PlaitPointerType, BoardTransforms } from '@plait/core';
import { BoardCreationMode, setCreationMode } from '@plait/common';

export type ThinkixTool =
    | 'select'
    | 'hand'
    | 'mind'
    | 'draw'
    // Basic shapes
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

export interface ThinkixState {
    activeTool: ThinkixTool;
    zoom: number;
}

interface ThinkixContextValue {
    board: PlaitBoard | null;
    setBoard: (board: PlaitBoard | null) => void;
    state: ThinkixState;
    setState: React.Dispatch<React.SetStateAction<ThinkixState>>;
    setActiveTool: (tool: ThinkixTool) => void;
}

const ThinkixContext = createContext<ThinkixContextValue | null>(null);

const TOOL_TO_POINTER: Record<ThinkixTool, string> = {
    'hand': PlaitPointerType.hand,
    'select': PlaitPointerType.selection,
    'mind': 'mind',
    'draw': 'vectorLine',
    // Basic shapes
    'rectangle': 'rectangle',
    'ellipse': 'ellipse',
    'diamond': 'diamond',
    'triangle': 'triangle',
    'roundRectangle': 'roundRectangle',
    'parallelogram': 'parallelogram',
    'trapezoid': 'trapezoid',
    'pentagon': 'pentagon',
    'hexagon': 'hexagon',
    'octagon': 'octagon',
    'star': 'star',
    'cloud': 'cloud',
    // Other tools
    'arrow': 'straight',
    'text': 'text',
    'image': 'image',
};

const DRAWING_TOOLS: Set<ThinkixTool> = new Set([
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

export function ThinkixProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [board, setBoard] = useState<PlaitBoard | null>(null);
    const [state, setState] = useState<ThinkixState>({
        activeTool: 'select',
        zoom: 100,
    });

    const boardRef = useRef<PlaitBoard | null>(null);
    boardRef.current = board;

    const setActiveTool = useCallback((tool: ThinkixTool) => {
        console.log('setActiveTool called with:', tool, 'board exists:', !!boardRef.current);
        setState(prev => ({ ...prev, activeTool: tool }));

        const currentBoard = boardRef.current;
        if (currentBoard) {
            const pointerType = TOOL_TO_POINTER[tool];
            console.log('Updating pointer type to:', pointerType, 'current pointer:', currentBoard.pointer);

            if (DRAWING_TOOLS.has(tool)) {
                setCreationMode(currentBoard, BoardCreationMode.drawing);
                console.log('Set creation mode to: drawing');
            } else {
                setCreationMode(currentBoard, BoardCreationMode.dnd);
                console.log('Set creation mode to: dnd');
            }

            BoardTransforms.updatePointerType(currentBoard, pointerType);
            console.log('Pointer type after update:', currentBoard.pointer);
        }
    }, []);

    const value = useMemo<ThinkixContextValue>(() => ({
        board,
        setBoard,
        state,
        setState,
        setActiveTool
    }), [board, state, setActiveTool]);

    return (
        <ThinkixContext.Provider value={value}>
            {children}
        </ThinkixContext.Provider>
    );
}

export function useThinkix() {
    const context = useContext(ThinkixContext);
    if (!context) {
        throw new Error('useThinkix must be used within a ThinkixProvider');
    }
    return context;
}
