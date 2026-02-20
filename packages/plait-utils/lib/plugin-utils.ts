import type { PlaitPlugin } from '@plait/core';

export function asPlaitPlugin(plugin: (...args: unknown[]) => unknown): PlaitPlugin {
  return plugin as unknown as PlaitPlugin;
}
