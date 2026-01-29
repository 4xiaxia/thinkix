import type { PlaitBoard, PlaitElement } from '@plait/core';
import { getSelectedElements } from '@plait/core';

export function getSelectedMindElements(board: PlaitBoard) {
  const selected = getSelectedElements(board);
  return selected; // Can be filtered by caller if needed
}

export function getCanvasContext(board: PlaitBoard): string {
  const elements = board.children;
  const selected = getSelectedElements(board);

  return JSON.stringify({
    elements,
    selected: selected.map((e: PlaitElement) => e.id),
    viewport: board.viewport,
  }, null, 2);
}

export function findElementById(board: PlaitBoard, id: string): PlaitElement | null {
  return board.children.find((e) => e.id === id) || null;
}
