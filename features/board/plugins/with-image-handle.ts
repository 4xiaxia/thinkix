import {
  getHitElementByPoint,
  isDragging,
  PlaitBoard,
  Point,
  toHostPoint,
  toViewBoxPoint,
} from '@plait/core';
import { isResizing } from '@plait/common';
import { MindElement } from '@plait/mind';
import { getElementOfFocusedImage } from '@plait/common';
import { isHitImage, ImageData } from '@plait/mind';

export function withImageHandle(board: PlaitBoard): PlaitBoard {
  const { pointerUp } = board;

  board.pointerUp = (event: PointerEvent) => {
    const focusedMindNode = getElementOfFocusedImage(board);

    if (
      focusedMindNode &&
      !isResizing(board) &&
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
        return pointerUp(event);
      }
    }

    pointerUp(event);
  };

  return board;
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
