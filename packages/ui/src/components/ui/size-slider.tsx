'use client';

import { forwardRef, useState, useCallback, type ChangeEvent } from 'react';
import { cn } from '@thinkix/ui';

export interface SizeSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const SizeSlider = forwardRef<HTMLInputElement, SizeSliderProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 20,
      step = 1,
      size = 'md',
      showValue = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        onChange(newValue);
      },
      [onChange]
    );

    const sizeStyles = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const thumbStyles = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          disabled={disabled}
          className={cn(
            'flex-1 cursor-pointer appearance-none rounded-full bg-secondary',
            sizeStyles[size],
            disabled && 'cursor-not-allowed opacity-50',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            isDragging && '[&::-webkit-slider-thumb]:scale-110',
            thumbStyles[size],
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:border-0'
          )}
          {...props}
        />
        {showValue && (
          <span className="text-xs text-muted-foreground w-6 text-center">{value}</span>
        )}
      </div>
    );
  }
);

SizeSlider.displayName = 'SizeSlider';
