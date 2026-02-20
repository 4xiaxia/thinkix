import type { PlaitPlugin, PlaitBoard } from '@plait/core';

export function asPlaitPlugin<T extends PlaitBoard>(extension: (board: T) => T): PlaitPlugin {
  return extension as unknown as PlaitPlugin;
}
