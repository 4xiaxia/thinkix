import {
  getElementOfFocusedImage,
  isResizing,
  type PlaitImageBoard,
} from '@plait/common';
import {
  ClipboardData,
  getHitElementByPoint,
  isDragging,
  isSelectionMoving,
  PlaitBoard,
  Point,
  toHostPoint,
  toViewBoxPoint,
  WritableClipboardOperationType,
} from '@plait/core';
import { isHitImage, MindElement, ImageData } from '@plait/mind';
import { DrawTransforms } from '@plait/draw';
import { MindTransforms } from '@plait/mind';
import { getSelectedElements } from '@plait/core';

const DEFAULT_IMAGE_WIDTH = 400;
const MIND_NODE_IMAGE_WIDTH = 240;

function isSupportedImageFileType(type: string): boolean {
  return type.startsWith('image/');
}

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImageElement(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataURL;
  });
}

async function insertImage(
  board: PlaitBoard,
  imageFile: File,
  startPoint?: Point,
  isDrop?: boolean
) {
  const selectedElements = getSelectedElements(board);
  const selectedElement = selectedElements[0];

  const defaultWidth =
    selectedElement && MindElement.isMindElement(board, selectedElement)
      ? MIND_NODE_IMAGE_WIDTH
      : DEFAULT_IMAGE_WIDTH;

  const dataURL = await fileToDataURL(imageFile);
  const image = await loadImageElement(dataURL);

  const width = image.width > defaultWidth ? defaultWidth : image.width;
  const height = (width / image.width) * image.height;

  const imageItem = { url: dataURL, width, height };

  const hitElement = startPoint
    ? getHitElementByPoint(board, startPoint)
    : null;

  if (
    isDrop &&
    hitElement &&
    MindElement.isMindElement(board, hitElement)
  ) {
    MindTransforms.setImage(board, hitElement, imageItem);
    return;
  }

  if (
    selectedElement &&
    MindElement.isMindElement(board, selectedElement) &&
    !isDrop
  ) {
    MindTransforms.setImage(board, selectedElement, imageItem);
  } else {
    DrawTransforms.insertImage(board, imageItem, startPoint);
  }
}

function openImageViewer(imageUrl: string) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80';
  modal.addEventListener('click', () => modal.remove());

  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'max-w-[90vw] max-h-[90vh] object-contain';
  img.addEventListener('click', (e) => e.stopPropagation());

  const closeBtn = document.createElement('button');
  closeBtn.className =
    'absolute top-4 right-4 text-white text-4xl hover:opacity-70 cursor-pointer';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => modal.remove());

  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove();
      window.removeEventListener('keydown', handleEscape);
    }
  };
  window.addEventListener('keydown', handleEscape);
}

export function withImageHandle(board: PlaitBoard): PlaitBoard {
  const newBoard = board as PlaitBoard & PlaitImageBoard;
  const { insertFragment, drop, pointerUp } = newBoard;

  newBoard.insertFragment = (
    clipboardData: ClipboardData | null,
    targetPoint: Point,
    operationType?: WritableClipboardOperationType
  ) => {
    if (
      clipboardData?.files?.length &&
      isSupportedImageFileType(clipboardData.files[0].type)
    ) {
      insertImage(board, clipboardData.files[0], targetPoint, false);
      return;
    }
    insertFragment(clipboardData, targetPoint, operationType);
  };

  newBoard.drop = (event: DragEvent) => {
    if (event.dataTransfer?.files?.length) {
      const imageFile = event.dataTransfer.files[0];
      if (isSupportedImageFileType(imageFile.type)) {
        const point = toViewBoxPoint(
          board,
          toHostPoint(board, event.x, event.y)
        );
        insertImage(board, imageFile, point, true);
        return true;
      }
    }
    return drop(event);
  };

  newBoard.pointerUp = (event: PointerEvent) => {
    const focusMindNode = getElementOfFocusedImage(board);
    if (
      focusMindNode &&
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
      if (isHittingImage && focusMindNode === hitElement) {
        openImageViewer(hitElement.data.image.url);
      }
    }
    pointerUp(event);
  };

  return newBoard;
}
