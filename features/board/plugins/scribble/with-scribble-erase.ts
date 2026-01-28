import {
  PlaitBoard,
  PlaitElement,
  Point,
  throttleRAF,
  toHostPoint,
  toViewBoxPoint,
} from '@plait/core';
import { isDrawingMode } from '@plait/common';
import { checkHitScribble } from './helpers';
import { ScribbleElement, ScribbleTool } from './types';
import { CoreTransforms } from '@plait/core';

export const withScribbleErase = (board: PlaitBoard) => {
  const {
    pointerDown,
    pointerMove,
    pointerUp,
    globalPointerUp,
    touchStart,
  } = board;

  let isErasingActive = false;
  const idsToRemove = new Set<string>();

  const findAndMarkScribbles = (point: Point) => {
    const viewPoint = toViewBoxPoint(
      board,
      toHostPoint(board, point[0], point[1])
    );

    const allScribbles = board.children.filter((element) =>
      ScribbleElement.isScribble(element)
    ) as ScribbleElement[];

    allScribbles.forEach((scribble) => {
      if (
        !idsToRemove.has(scribble.id) &&
        checkHitScribble(board, scribble, viewPoint)
      ) {
        PlaitElement.getElementG(scribble).style.opacity = '0.2';
        idsToRemove.add(scribble.id);
      }
    });
  };

  const deleteMarkedScribbles = () => {
    if (idsToRemove.size > 0) {
      const toDelete = board.children.filter((element) =>
        idsToRemove.has(element.id)
      );

      if (toDelete.length > 0) {
        CoreTransforms.removeElements(board, toDelete);
      }
    }
  };

  const completeErasing = () => {
    if (isErasingActive) {
      deleteMarkedScribbles();
      isErasingActive = false;
      idsToRemove.clear();
    }
  };

  board.touchStart = (event: TouchEvent) => {
    const isEraser = PlaitBoard.isInPointer(board, [ScribbleTool.eraser]);
    if (isEraser && isDrawingMode(board)) {
      return event.preventDefault();
    }
    touchStart(event);
  };

  board.pointerDown = (event: PointerEvent) => {
    const isEraser = PlaitBoard.isInPointer(board, [ScribbleTool.eraser]);

    if (isEraser && isDrawingMode(board)) {
      isErasingActive = true;
      idsToRemove.clear();
      const current: Point = [event.x, event.y];
      findAndMarkScribbles(current);
      return;
    }

    pointerDown(event);
  };

  board.pointerMove = (event: PointerEvent) => {
    if (isErasingActive) {
      throttleRAF(board, 'scribble-erase', () => {
        const current: Point = [event.x, event.y];
        findAndMarkScribbles(current);
      });
      return;
    }
    pointerMove(event);
  };

  board.pointerUp = (event: PointerEvent) => {
    if (isErasingActive) {
      completeErasing();
      return;
    }
    pointerUp(event);
  };

  board.globalPointerUp = (event: PointerEvent) => {
    if (isErasingActive) {
      completeErasing();
      return;
    }
    globalPointerUp(event);
  };

  return board;
};
