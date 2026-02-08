'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { PlaitBoard } from '@plait/core';
import { useBoardStore } from '@thinkix/storage';

interface UseAutoSaveOptions {
  board: PlaitBoard | null;
  enabled?: boolean;
}

export function useAutoSave({ board, enabled = true }: UseAutoSaveOptions) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveBoard = useBoardStore((s) => s.saveBoard);
  const currentBoard = useBoardStore((s) => s.currentBoard);

  const boardRef = useRef<PlaitBoard | null>(board);
  const currentBoardRef = useRef(currentBoard);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { currentBoardRef.current = currentBoard; }, [currentBoard]);

  const triggerSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const b = boardRef.current;
      const cb = currentBoardRef.current;

      if (!b || !cb?.id) return;

      await saveBoard({
        id: cb.id,
        name: cb.name,
        elements: b.children,
        viewport: { x: b.viewport.x ?? 0, y: b.viewport.y ?? 0, zoom: b.viewport.zoom ?? 1 },
        createdAt: cb.createdAt,
        updatedAt: Date.now(),
      });
    }, 500);
  }, []);

  useEffect(() => {
    if (!board || !enabled) return;

    const handlePointerUp = () => {
      triggerSave();
    };

    const boardEl = document.querySelector('.plait-board-container') || document.querySelector('svg');
    if (!boardEl) return;

    boardEl.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true } as any);

    return () => {
      boardEl.removeEventListener('pointerup', handlePointerUp, { capture: true } as any);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [board, enabled, triggerSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);
}
