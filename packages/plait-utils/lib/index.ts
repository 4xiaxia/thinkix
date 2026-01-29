import type { PlaitBoard, PlaitElement } from '@plait/core';
import { MindElement } from '@plait/mind';

export function getSelectedMindElements(board: PlaitBoard): MindElement[] {
  const selected = board.selection ? board.selection : [];
  return selected.filter((e) => MindElement.isMindElement(board, e)) as MindElement[];
}

export function getCanvasContext(board: PlaitBoard): string {
  const elements = PlaitBoard.getValue(board);
  const selected = board.selection || [];

  return JSON.stringify({
    elements,
    selected: selected.map((e: PlaitElement) => e.id),
    viewport: board.viewport,
  }, null, 2);
}

export function findElementById(board: PlaitBoard, id: string): PlaitElement | null {
  const elements = PlaitBoard.getValue(board) as PlaitElement[];
  return elements.find((e) => e.id === id) || null;
}
