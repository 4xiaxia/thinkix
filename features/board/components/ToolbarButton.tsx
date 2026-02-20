import { cn } from '@thinkix/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@thinkix/ui';
import type { ReactNode } from 'react';

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  isSelected?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ToolbarButton({ icon, label, isSelected, onPointerDown }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'h-7 w-7 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isSelected && 'bg-accent text-accent-foreground'
          )}
          onPointerDown={onPointerDown}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
