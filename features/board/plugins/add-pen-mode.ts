import { isPencilEvent, PlaitBoard } from '@plait/core';

const PEN_MODE_BOARDS = new WeakMap<PlaitBoard, boolean>();

function isPenModeEnabled(board: PlaitBoard): boolean {
  return PEN_MODE_BOARDS.get(board) === true;
}

function enablePenMode(board: PlaitBoard, enabled: boolean): void {
  PEN_MODE_BOARDS.set(board, enabled);
}

export function isPenModeActive(board: PlaitBoard): boolean {
  return isPenModeEnabled(board);
}

export function addPenMode(board: PlaitBoard): PlaitBoard {
  const { pointerDown } = board;

  board.pointerDown = (event: PointerEvent) => {
    const isPenInput = isPencilEvent(event);
    const currentlyInPenMode = isPenModeEnabled(board);

    if (isPenInput && !currentlyInPenMode) {
      enablePenMode(board, true);
    }

    if (currentlyInPenMode && !isPenInput) {
      return;
    }

    pointerDown(event);
  };

  return board;
}
