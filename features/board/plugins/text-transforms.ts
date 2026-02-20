import { Transforms, PlaitBoard, getSelectedElements } from '@plait/core';
import type { PlaitElement } from '@plait/core';
import { MindElement } from '@plait/mind';
import type { Element as SlateElement } from 'slate';

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strike?: boolean;
  color?: string;
  'font-size'?: string | number;
};

type MarkKey = 'bold' | 'italic' | 'underlined' | 'strike';

function isCustomText(node: any): node is CustomText {
  return node && typeof node.text === 'string';
}

function getTextFromElement(element: PlaitElement, board: PlaitBoard): SlateElement | null {
  if (MindElement.isMindElement(board, element)) {
    return (element as any).data?.topic || null;
  }
  return (element as any).text || null;
}

function isMindNode(element: PlaitElement, board: PlaitBoard): boolean {
  return MindElement.isMindElement(board, element);
}

function addMarkToText(
  text: SlateElement,
  mark: MarkKey,
  value: boolean
): SlateElement {
  return {
    ...text,
    children: text.children.map((child: any) => {
      if (isCustomText(child)) {
        return { ...child, [mark]: value };
      }
      return child;
    }),
  };
}

function removeMarkFromText(text: SlateElement, mark: MarkKey): SlateElement {
  return {
    ...text,
    children: text.children.map((child: any) => {
      if (isCustomText(child)) {
        const { [mark]: _, ...rest } = child;
        return rest;
      }
      return child;
    }),
  };
}

function getMarkValue(text: SlateElement, mark: MarkKey): boolean | undefined {
  for (const child of text.children) {
    if (isCustomText(child) && child[mark] === true) {
      return true;
    }
    if (isCustomText(child) && child[mark] === false) {
      return false;
    }
  }
  return undefined;
}

function setTextColorOnElement(
  text: SlateElement,
  color: string | null
): SlateElement {
  return {
    ...text,
    children: text.children.map((child: any) => {
      if (isCustomText(child)) {
        if (color === null) {
          const { color: _, ...rest } = child;
          return rest;
        }
        return { ...child, color };
      }
      return child;
    }),
  };
}

function setFontSizeOnElement(
  text: SlateElement,
  fontSize: string | null
): SlateElement {
  return {
    ...text,
    children: text.children.map((child: any) => {
      if (isCustomText(child)) {
        if (fontSize === null) {
          const { 'font-size': _, ...rest } = child;
          return rest;
        }
        return { ...child, 'font-size': fontSize };
      }
      return child;
    }),
  };
}

export function applyTextMark(
  board: any,
  mark: MarkKey,
  elements?: PlaitElement[]
) {
  const targetElements = elements || getSelectedElements(board);
  
  targetElements.forEach((element: PlaitElement) => {
    const text = getTextFromElement(element, board);
    if (!text) return;
    
    const currentValue = getMarkValue(text, mark);
    const newValue = !currentValue;
    
    const newText = newValue
      ? addMarkToText(text, mark, true)
      : removeMarkFromText(text, mark);
    
    const path = PlaitBoard.findPath(board, element);
    if (path) {
      if (isMindNode(element, board)) {
        Transforms.setNode(board, { data: { ...(element as any).data, topic: newText } }, path);
      } else {
        Transforms.setNode(board, { text: newText }, path);
      }
    }
  });
}

export function applyTextColor(
  board: any,
  color: string | null,
  elements?: PlaitElement[]
) {
  const targetElements = elements || getSelectedElements(board);
  
  targetElements.forEach((element: PlaitElement) => {
    const text = getTextFromElement(element, board);
    if (!text) return;
    
    const newText = setTextColorOnElement(text, color);
    
    const path = PlaitBoard.findPath(board, element);
    if (path) {
      if (isMindNode(element, board)) {
        Transforms.setNode(board, { data: { ...(element as any).data, topic: newText } }, path);
      } else {
        Transforms.setNode(board, { text: newText }, path);
      }
    }
  });
}

export function applyFontSize(
  board: any,
  fontSize: string,
  elements?: PlaitElement[]
) {
  const targetElements = elements || getSelectedElements(board);
  
  targetElements.forEach((element: PlaitElement) => {
    const text = getTextFromElement(element, board);
    if (!text) return;
    
    const newText = setFontSizeOnElement(text, fontSize);
    
    const path = PlaitBoard.findPath(board, element);
    if (path) {
      if (isMindNode(element, board)) {
        Transforms.setNode(board, { data: { ...(element as any).data, topic: newText } }, path);
      } else {
        Transforms.setNode(board, { text: newText }, path);
      }
    }
  });
}

export function getTextMarks(element: PlaitElement, board?: PlaitBoard) {
  const text = board ? getTextFromElement(element, board) : (element as any).text as SlateElement | undefined;
  if (!text || !text.children) {
    return {
      bold: undefined,
      italic: undefined,
      underlined: undefined,
      strike: undefined,
      color: undefined,
      'font-size': undefined,
    };
  }

  const marks: any = {};
  
  for (const mark of ['bold', 'italic', 'underlined', 'strike'] as MarkKey[]) {
    marks[mark] = getMarkValue(text, mark);
  }
  
  for (const child of text.children) {
    if (isCustomText(child)) {
      if (child.color) marks.color = child.color;
      if (child['font-size']) marks['font-size'] = child['font-size'];
    }
  }
  
  return marks;
}
