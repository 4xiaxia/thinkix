import type {
  EmojiProps,
  PlaitMindBoard,
  PlaitMindEmojiBoard,
  WithMindOptions,
} from '@plait/mind';
import type { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import type { RenderComponentRef } from '@plait/common';
import { createRoot } from 'react-dom/client';
import { Emoji } from './emoji-component';

const MIND_OPTIONS_KEY = 'plait-mind-plugin-key';

export function addEmojiRenderer(board: PlaitBoard): PlaitBoard {
  const emojiBoard = board as PlaitBoard & PlaitMindBoard & PlaitMindEmojiBoard;

  (board as PlaitOptionsBoard).setPluginOptions<WithMindOptions>(
    MIND_OPTIONS_KEY,
    {
      emojiPadding: 0,
      spaceBetweenEmojis: 4,
    }
  );

  emojiBoard.renderEmoji = (
    container: Element | DocumentFragment,
    props: EmojiProps
  ) => {
    const host = document.createElement('span');
    container.appendChild(host);

    const root = createRoot(host);
    root.render(<Emoji {...props} />);

    let activeProps = { ...props };

    const ref: RenderComponentRef<EmojiProps> = {
      destroy: () => {
        requestIdleCallback(() => {
          root.unmount();
        });
      },
      update: (updatedProps: Partial<EmojiProps>) => {
        activeProps = { ...activeProps, ...updatedProps };
        root.render(<Emoji {...activeProps} />);
      },
    };

    return ref;
  };

  return emojiBoard;
}
