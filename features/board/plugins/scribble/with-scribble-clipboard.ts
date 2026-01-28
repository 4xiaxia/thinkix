import {
  ClipboardData,
  PlaitBoard,
  PlaitElement,
  Point,
  RectangleClient,
  WritableClipboardContext,
  WritableClipboardOperationType,
  WritableClipboardType,
  addOrCreateClipboardContext,
} from '@plait/core';
import { getSelectedScribbles } from './helpers';
import { ScribbleElement } from './types';
import {
  buildClipboardData,
  insertClipboardData,
} from '@plait/common';

export const withScribbleClipboard = (baseBoard: PlaitBoard) => {
  const board = baseBoard as PlaitBoard;
  const { getDeletedFragment, buildFragment, insertFragment } = board;

  board.getDeletedFragment = (data: PlaitElement[]) => {
    const selectedScribbles = getSelectedScribbles(board);
    if (selectedScribbles.length) {
      data.push(...selectedScribbles);
    }
    return getDeletedFragment(data);
  };

  board.buildFragment = (
    clipboardContext: WritableClipboardContext | null,
    rectangle: RectangleClient | null,
    operationType: WritableClipboardOperationType,
    originData?: PlaitElement[]
  ) => {
    const selectedScribbles = getSelectedScribbles(board);
    if (selectedScribbles.length) {
      const elements = buildClipboardData(
        board,
        selectedScribbles,
        rectangle ? [rectangle.x, rectangle.y] : [0, 0]
      );
      clipboardContext = addOrCreateClipboardContext(clipboardContext, {
        text: '',
        type: WritableClipboardType.elements,
        elements,
      });
    }
    return buildFragment(
      clipboardContext,
      rectangle,
      operationType,
      originData
    );
  };

  board.insertFragment = (
    clipboardData: ClipboardData | null,
    targetPoint: Point,
    operationType?: WritableClipboardOperationType
  ) => {
    const scribbleElements = clipboardData?.elements?.filter((value) =>
      ScribbleElement.isScribble(value)
    ) as ScribbleElement[];
    if (scribbleElements && scribbleElements.length > 0) {
      insertClipboardData(board, scribbleElements, targetPoint);
    }
    insertFragment(clipboardData, targetPoint, operationType);
  };

  return board;
};
