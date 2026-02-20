import type { PlaitBoard, PlaitElement, Path, Transforms } from '@plait/core';
import { MindElement } from '@plait/mind';
import type { Element as SlateElement } from 'slate';

export interface TextAccessor {
  get(element: PlaitElement): SlateElement | null;
  set(
    board: PlaitBoard,
    element: PlaitElement,
    path: Path,
    text: SlateElement,
    transforms: typeof Transforms
  ): void;
}

const drawTextAccessor: TextAccessor = {
  get(element: PlaitElement): SlateElement | null {
    return (element as { text?: SlateElement }).text ?? null;
  },
  set(board, element, path, text, transforms) {
    transforms.setNode(board, { text }, path);
  },
};

const mindTextAccessor: TextAccessor = {
  get(element: PlaitElement): SlateElement | null {
    const data = (element as { data?: { topic?: SlateElement } }).data;
    return data?.topic ?? null;
  },
  set(board, element, path, text, transforms) {
    const data = (element as { data?: Record<string, unknown> }).data;
    transforms.setNode(board, { data: { ...data, topic: text } }, path);
  },
};

export function getTextAccessor(board: PlaitBoard, element: PlaitElement): TextAccessor | null {
  if (MindElement.isMindElement(board, element)) {
    return mindTextAccessor;
  }
  
  const hasText = (element as { text?: SlateElement }).text !== undefined;
  if (hasText) {
    return drawTextAccessor;
  }
  
  return null;
}
