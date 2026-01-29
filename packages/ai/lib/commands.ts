import type { PlaitBoard } from '@plait/core';
import { MindTransforms, PlaitBoard as MindPlaitBoard } from '@plait/mind';
import { Transforms } from '@plait/core';

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
      MindTransforms.insertNode(board as MindPlaitBoard, command.data);
      break;
    case 'addNode':
      Transforms.setNode(board, command.data);
      break;
    case 'updateNode':
      Transforms.setNode(board, command.data, PlaitBoard.findPath(board, command.data.element));
      break;
    case 'deleteSelection':
      // Handle deletion
      break;
  }
}
