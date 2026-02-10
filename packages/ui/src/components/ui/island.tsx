'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@thinkix/ui';

export interface IslandProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number;
}

export const Island = forwardRef<HTMLDivElement, IslandProps>(
  ({ className, padding = 1, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg border bg-background/95 backdrop-blur shadow-lg',
          className
        )}
        style={{ padding: `${padding * 0.25}rem`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Island.displayName = 'Island';
