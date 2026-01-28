'use client';

import {
  PlaitBoard,
  PlaitPluginElementContext,
  OnContextChanged,
  RectangleClient,
  ACTIVE_STROKE_WIDTH,
} from '@plait/core';
import {
  ActiveGenerator,
  CommonElementFlavour,
  createActiveGenerator,
  hasResizeHandle,
} from '@plait/common';
import { ScribbleElement } from './types';
import { ScribbleRenderer } from './scribble-renderer';

export class ScribbleComponent
  extends CommonElementFlavour<ScribbleElement, PlaitBoard>
  implements OnContextChanged<ScribbleElement, PlaitBoard>
{
  constructor() {
    super();
  }

  activeGenerator!: ActiveGenerator<ScribbleElement>;

  renderer!: ScribbleRenderer;

  initializeComponent() {
    this.activeGenerator = createActiveGenerator(this.board, {
      getRectangle: (element: ScribbleElement) => {
        return RectangleClient.getRectangleByPoints(element.points);
      },
      getStrokeWidth: () => ACTIVE_STROKE_WIDTH,
      getStrokeOpacity: () => 1,
      hasResizeHandle: () => {
        return hasResizeHandle(this.board, this.element);
      },
    });
    this.renderer = new ScribbleRenderer(this.board);
  }

  initialize(): void {
    super.initialize();
    this.initializeComponent();
    this.renderer.processDrawing(this.element, this.getElementG());
  }

  onContextChanged(
    current: PlaitPluginElementContext<ScribbleElement, PlaitBoard>,
    previous: PlaitPluginElementContext<ScribbleElement, PlaitBoard>
  ) {
    if (current.element !== previous.element || current.hasThemeChanged) {
      this.renderer.processDrawing(this.element, this.getElementG());
      this.activeGenerator.processDrawing(
        this.element,
        PlaitBoard.getActiveHost(this.board),
        {
          selected: this.selected,
        }
      );
    } else {
      const needsUpdate = current.selected !== previous.selected;
      if (needsUpdate || current.selected) {
        this.activeGenerator.processDrawing(
          this.element,
          PlaitBoard.getActiveHost(this.board),
          {
            selected: this.selected,
          }
        );
      }
    }
  }

  destroy(): void {
    super.destroy();
    this.activeGenerator?.destroy();
  }
}
