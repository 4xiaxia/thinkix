import type { PlaitBoard } from '@plait/core';
import type { PlaitMindBoard } from '@plait/mind';
import { MindTransforms } from '@plait/mind';

export interface CanvasCommand {
  type: 'createMindmap' | 'addNode' | 'addEdge' | 'updateNode' | 'deleteSelection';
  data: any;
}

export interface MindmapNodeData {
  text: string;
  position: [number, number];
  parentId?: string;
}

export interface UpdateNodeData {
  width?: number;
  height?: number;
  text?: string;
}

export function executeCommand(board: PlaitBoard, command: CanvasCommand): void {
  switch (command.type) {
    case 'createMindmap':
      MindTransforms.insertMind(board as PlaitMindBoard, command.data);
      break;
    case 'addNode':
      // TODO: Implement addNode operation
      break;
    case 'updateNode':
      // TODO: Implement updateNode operation
      break;
    case 'deleteSelection':
      // TODO: Implement deleteSelection operation
      break;
  }
}
