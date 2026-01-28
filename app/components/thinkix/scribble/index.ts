import {
  PlaitBoard,
  PlaitElement,
  PlaitOptionsBoard,
  PlaitPluginElementContext,
  RectangleClient,
  Selection,
} from '@plait/core';
import { ScribbleElement, SCRIBBLE_ELEMENT_TYPE } from './types';
import { ScribbleComponent } from './scribble-component';
import { withScribbleDraw } from './with-scribble-draw';
import { checkHitScribble, checkRectangleHitScribble } from './helpers';
import { withScribbleClipboard } from './with-scribble-clipboard';
import {
  getHitDrawElement,
  WithDrawOptions,
  WithDrawPluginKey,
} from '@plait/draw';
import { withScribbleErase } from './with-scribble-erase';

export const withScribble = (board: PlaitBoard) => {
  const {
    drawElement,
    getRectangle,
    isHit,
    isRectangleHit,
    getOneHitElement,
    isMovable,
    isAlign,
  } = board;

  board.drawElement = (context: PlaitPluginElementContext) => {
    if (ScribbleElement.isScribble(context.element)) {
      return ScribbleComponent;
    }
    return drawElement(context);
  };

  board.getRectangle = (element: PlaitElement) => {
    if (ScribbleElement.isScribble(element)) {
      return RectangleClient.getRectangleByPoints(element.points);
    }
    return getRectangle(element);
  };

  board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
    if (ScribbleElement.isScribble(element)) {
      return checkRectangleHitScribble(board, element, selection);
    }
    return isRectangleHit(element, selection);
  };

  board.isHit = (element, point, isStrict?: boolean) => {
    if (ScribbleElement.isScribble(element)) {
      return checkHitScribble(board, element, point);
    }
    return isHit(element, point, isStrict);
  };

  board.getOneHitElement = (elements) => {
    const allAreScribbles = elements.every((item) =>
      ScribbleElement.isScribble(item)
    );
    if (allAreScribbles) {
      return getHitDrawElement(board, elements as ScribbleElement[]);
    }
    return getOneHitElement(elements);
  };

  board.isMovable = (element) => {
    if (ScribbleElement.isScribble(element)) {
      return true;
    }
    return isMovable(element);
  };

  board.isAlign = (element) => {
    if (ScribbleElement.isScribble(element)) {
      return true;
    }
    return isAlign(element);
  };

  (board as PlaitOptionsBoard).setPluginOptions<WithDrawOptions>(
    WithDrawPluginKey,
    { customGeometryTypes: [SCRIBBLE_ELEMENT_TYPE] }
  );

  return withScribbleErase(
    withScribbleClipboard(withScribbleDraw(board))
  );
};

export * from './types';
export * from './helpers';
