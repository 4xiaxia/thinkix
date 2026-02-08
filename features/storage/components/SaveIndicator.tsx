'use client';

import type { SaveStatus } from '@thinkix/storage';

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function SaveIndicator({ status, className = '' }: SaveIndicatorProps) {
  const icons = {
    idle: '',
    saving: '●',
    saved: '✓',
    error: '✕',
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      {icons[status as keyof typeof icons]}
      {status === 'saving' && <span>Saving...</span>}
      {status === 'saved' && <span className="text-green-500">Saved</span>}
      {status === 'error' && <span className="text-destructive">Save failed</span>}
    </div>
  );
}
