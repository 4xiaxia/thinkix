import type { EmojiProps } from '@plait/mind';

export function Emoji(props: EmojiProps) {
  return <span>{props.emojiItem.name}</span>;
}
