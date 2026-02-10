import { forwardRef } from 'react';
import { cn } from '@thinkix/ui';

export interface NoColorIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

export const NoColorIcon = forwardRef<SVGSVGElement, NoColorIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-4 w-4', className)}
        {...props}
      >
        <rect
          x="1"
          y="1"
          width="18"
          height="18"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
);

NoColorIcon.displayName = 'NoColorIcon';
