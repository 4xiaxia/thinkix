import { getSelectedElements } from '@plait/core';

export function getSelectedMindElements(board: any) {
  const selected = getSelectedElements(board);
  return selected;
}

export function getCanvasContext(board: any): string {
  const elements = board.children;
  const selected = getSelectedElements(board);

  return JSON.stringify({
    elements,
    selected: selected.map((e: any) => e.id),
    viewport: board.viewport,
  }, null, 2);
}

export function findElementById(board: any, id: string): any {
  return board.children.find((e: any) => e.id === id) || null;
}

export { getSelectedElements } from '@plait/core';
