import { Generator } from '@plait/common';
import { PlaitBoard, setStrokeLinecap } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { ScribbleElement } from './types';
import {
  applyGaussianSmoothing,
  getElementFill,
  getElementStrokeColor,
} from './helpers';
import { getStrokeWidthByElement } from '@plait/draw';

export class ScribbleRenderer extends Generator<ScribbleElement> {
  protected draw(element: ScribbleElement): SVGGElement | undefined {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getElementStrokeColor(this.board, element);
    const fill = getElementFill(this.board, element);

    const renderOptions: Options = {
      strokeWidth,
      stroke: strokeColor,
      fill,
      fillStyle: 'solid',
    };

    const smoothedPath = applyGaussianSmoothing(element.points, 1, 3);
    const g = PlaitBoard.getRoughSVG(this.board).curve(
      smoothedPath,
      renderOptions
    );
    setStrokeLinecap(g, 'round');
    return g;
  }

  canDraw(element: ScribbleElement): boolean {
    return true;
  }
}
