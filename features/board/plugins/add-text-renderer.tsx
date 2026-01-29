'use client';

import { createRoot } from 'react-dom/client';
import type { PlaitTextBoard } from '@plait/common';
import { Text } from '@plait-board/react-text';

export function addTextRenderer(board: PlaitTextBoard) {
  board.renderText = (container, props) => {
    const root = createRoot(container);
    root.render(<Text {...props} />);
    return {
      update: (newProps) => {
        root.render(<Text {...newProps} />);
      },
      destroy: () => root.unmount()
    };
  };
  return board;
}
