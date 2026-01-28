import {
  ClipboardData,
  getHitElementByPoint,
  getSelectedElements,
  isDragging,
  isSelectionMoving,
  PlaitBoard,
  Point,
  toHostPoint,
  toViewBoxPoint,
  WritableClipboardOperationType,
} from '@plait/core';
import { isResizing } from '@plait/common';
import { MindElement, MindTransforms } from '@plait/mind';
import { DrawTransforms } from '@plait/draw';
import { getElementOfFocusedImage } from '@plait/common';
import { loadImageFromFile, isSupportedImageType } from '@/shared/utils/image';
import { isHitImage, ImageData } from '@plait/mind';

const DEFAULT_IMAGE_WIDTH = 400;
const MIND_NODE_IMAGE_WIDTH = 240;

export function withImageHandle(board: PlaitBoard): PlaitBoard {
  const { insertFragment, drop, pointerUp } = board;


  board.insertFragment = (
    clipboardData: ClipboardData | null,
    targetPoint: Point,
    operationType?: WritableClipboardOperationType
  ) => {
    if (clipboardData?.files?.length) {
      const file = clipboardData.files[0];
      if (isSupportedImageType(file.type)) {
        handleImageInsert(board, file, targetPoint, false);
        return;
      }
    }

    insertFragment(clipboardData, targetPoint, operationType);
  };


  board.drop = (event: DragEvent) => {
    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      if (isSupportedImageType(file.type)) {
        const point = toViewBoxPoint(
          board,
          toHostPoint(board, event.x, event.y)
        );
        handleImageInsert(board, file, point, true);
        return true;
      }
    }
    return drop(event);
  };


  board.pointerUp = (event: PointerEvent) => {
    const focusedMindNode = getElementOfFocusedImage(board);

    if (
      focusedMindNode &&
      !isResizing(board) &&
      !isSelectionMoving(board) &&
      !isDragging(board)
    ) {
      const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
      const hitElement = getHitElementByPoint(board, point);

      const isHittingImage =
        hitElement &&
        MindElement.isMindElement(board, hitElement) &&
        MindElement.hasImage(hitElement) &&
        isHitImage(board, hitElement as MindElement<ImageData>, point);

      if (isHittingImage && focusedMindNode === hitElement) {
        openImageViewer(hitElement.data.image.url);
      }
    }

    pointerUp(event);
  };

  return board;
}

/**
 * Insert an image into the board
 * Handles both mind map nodes and regular board insertion
 */
async function handleImageInsert(
  board: PlaitBoard,
  file: File,
  startPoint: Point | undefined,
  isDrop: boolean
) {
  const selectedElements = getSelectedElements(board);
  const selectedElement = selectedElements[0];

  const defaultWidth =
    selectedElement && MindElement.isMindElement(board, selectedElement)
      ? MIND_NODE_IMAGE_WIDTH
      : DEFAULT_IMAGE_WIDTH;

  try {
    const imageItem = await loadImageFromFile(file, defaultWidth);
    const hitElement = startPoint
      ? getHitElementByPoint(board, startPoint)
      : null;

    // Handle dropping onto a mind map node
    if (
      isDrop &&
      hitElement &&
      MindElement.isMindElement(board, hitElement)
    ) {
      MindTransforms.setImage(board, hitElement, imageItem);
      return;
    }

    // Handle selecting a mind map node and inserting image
    if (
      selectedElement &&
      MindElement.isMindElement(board, selectedElement) &&
      !isDrop
    ) {
      MindTransforms.setImage(board, selectedElement, imageItem);
      return;
    }

    // Regular board insertion
    DrawTransforms.insertImage(board, imageItem, startPoint);
  } catch (error) {
    console.error('Failed to insert image:', error);
  }
}

/**
 * Open an image in a viewer modal
 */
function openImageViewer(imageUrl: string) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80';
  modal.addEventListener('click', () => modal.remove());

  // Create image
  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'max-w-[90vw] max-h-[90vh] object-contain';
  img.addEventListener('click', (e) => e.stopPropagation());

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.className =
    'absolute top-4 right-4 text-white text-4xl hover:opacity-70 cursor-pointer';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => modal.remove());

  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  // Close on escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove();
      window.removeEventListener('keydown', handleEscape);
    }
  };
  window.addEventListener('keydown', handleEscape);
}
