import { forwardRef, type ReactNode } from 'react';
import { cn } from '@thinkix/ui';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'column', gap = 0, align, justify, wrap, style, children, ...props }, ref) => {
    const stackStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      gap: `${gap * 0.25}rem`,
      alignItems: align === 'stretch' ? 'stretch' : align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...style,
    };

    return (
      <div ref={ref} className={cn(className)} style={stackStyle} {...props}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
