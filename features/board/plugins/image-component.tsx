import type { ImageProps } from '@plait/common';
import { useEffect, useRef } from 'react';

export function Image(props: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const { url } = props.imageItem;
  const rectangle = props.getRectangle();

  useEffect(() => {
    const image = ref.current;
    if (!image) return;

    if (image.complete) {
      (props as any).onLoad?.();
    } else {
      image.addEventListener('load', () => (props as any).onLoad?.());
      image.addEventListener('error', () => (props as any).onError?.());
    }

    return () => {
      image.removeEventListener('load', () => (props as any).onLoad?.());
      image.removeEventListener('error', () => (props as any).onError?.());
    };
  }, []);

  return (
    <img
      ref={ref}
      src={url}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${rectangle.width}px`,
        height: `${rectangle.height}px`,
        pointerEvents: 'none',
      }}
      draggable={false}
    />
  );
}
