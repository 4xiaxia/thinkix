'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BoardProvider } from '@/features/board/hooks/use-board-state';
import { BoardSwitcher, useBoardStore } from '@/features/storage';
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

function BoardApp() {
  const { initialize, boards, currentBoard, isLoading, createBoard, switchBoard, deleteBoard, renameBoard } = useBoardStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleCreateBoard = async (name: string) => {
    await createBoard(name);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-background">
      <div className="absolute top-4 left-4 z-50" data-no-autosave>
        <BoardSwitcher
          boards={boards}
          currentBoardId={currentBoard?.id ?? null}
          onCreateBoard={handleCreateBoard}
          onSelectBoard={switchBoard}
          onDeleteBoard={deleteBoard}
          onRenameBoard={renameBoard}
        />
      </div>
      <BoardCanvas boardData={currentBoard}>
        <BoardToolbar />
      </BoardCanvas>
    </main>
  );
}

export default function HomePage() {
  return (
    <BoardProvider>
      <BoardApp />
    </BoardProvider>
  );
}
