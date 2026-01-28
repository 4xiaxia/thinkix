'use client';

import dynamic from 'next/dynamic';

const ThinkixBoard = dynamic(
  () => import('./components/thinkix').then((mod) => mod.ThinkixBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-pulse text-muted-foreground">Loading board...</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background">
      <ThinkixBoard />
    </main>
  );
}
