'use client';

import dynamic from 'next/dynamic';
import { BoardProvider } from '@/features/board/hooks/use-board-state';
import type { BoardCanvasProps } from '@/features/board';

const BoardCanvas = dynamic(
  () => import('@/features/board').then((mod) => mod.BoardCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-pulse text-muted-foreground">Loading board...</div>
      </div>
    ),
  }
);

const BoardToolbar = dynamic(
  () => import('@/features/toolbar').then((mod) => mod.BoardToolbar),
  {
    ssr: false,
  }
);

export default function HomePage() {
  return (
    <BoardProvider>
      <main className="w-screen h-screen overflow-hidden bg-background">
        <BoardCanvas>
          <BoardToolbar />
        </BoardCanvas>
      </main>
    </BoardProvider>
  );
}
