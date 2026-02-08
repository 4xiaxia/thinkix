// Hooks
export { useAutoSave } from './hooks/use-auto-save';

// Store (re-export from package)
export { useBoardStore } from '@thinkix/storage';

// Components
export { BoardSwitcher } from './components/BoardSwitcher';
export { SaveIndicator } from './components/SaveIndicator';

// Types (re-export from package)
export type { Board, BoardMetadata, SaveStatus } from '@thinkix/storage';
