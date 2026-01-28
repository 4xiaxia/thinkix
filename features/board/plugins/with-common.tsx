import type {
  ImageProps,
  PlaitImageBoard,
  RenderComponentRef,
} from '@plait/common';
import { PlaitBoard } from '@plait/core';
import { createRoot } from 'react-dom/client';
import { Image } from './image-component';

export function withCommon(board: PlaitBoard): PlaitBoard {
  const newBoard = board as PlaitBoard & PlaitImageBoard;

  newBoard.renderImage = (
    container: Element | DocumentFragment,
    props: ImageProps
  ) => {
    const root = createRoot(container);
    root.render(<Image {...props} />);

    let currentProps = { ...props };
    const ref: RenderComponentRef<ImageProps> = {
      destroy: () => {
        setTimeout(() => {
          root.unmount();
        }, 0);
      },
      update: (updatedProps: Partial<ImageProps>) => {
        currentProps = { ...currentProps, ...updatedProps };
        root.render(<Image {...currentProps} />);
      },
    };
    return ref;
  };

  return newBoard;
}
