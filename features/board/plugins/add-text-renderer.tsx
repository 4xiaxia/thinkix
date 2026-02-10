'use client';

import { createRoot } from 'react-dom/client';
import type { PlaitTextBoard, PlaitTextElement } from '@plait/common';
import type { Element as SlateElement, Descendant } from 'slate';
import { createEditor, type Editor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { Slate, Editable } from 'slate-react';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { isKeyHotkey } from 'is-hotkey';
import { Transforms, Range, Node } from 'slate';
import type { CustomElement, CustomText } from '@plait/common';
import { Transforms as PlaitTransforms, Path } from '@plait/core';
import { PlaitBoard } from '@plait/core';

type ParagraphElement = CustomElement & { align?: 'left' | 'center' | 'right' };

interface TextWrapperProps {
  text?: SlateElement;
  readonly?: boolean;
  onChange?: (data: { newText: SlateElement; operations: any[] }) => void;
  afterInit?: (editor: Editor) => void;
  onComposition?: (event: CompositionEvent) => void;
  element?: PlaitTextElement;
  path?: Path;
  board?: PlaitBoard;
}

const DEFAULT_CHINESE_TEXT = '文本';

function getTextString(text: SlateElement): string {
  return Node.string(text);
}

function normalizeTextValue(text: SlateElement | undefined): SlateElement {
  if (!text) {
    return { children: [{ text: '' }] };
  }
  if (!text.children || !Array.isArray(text.children)) {
    return { ...text, children: [{ text: '' }] };
  }
  const hasNullChildren = text.children.some((child: any) => child === null || child === undefined);
  if (hasNullChildren) {
    return {
      ...text,
      children: text.children.map((child: any) =>
        child === null || child === undefined ? { text: '' } : child
      )
    };
  }
  if (text.children.length === 0) {
    return { ...text, children: [{ text: '' }] };
  }

  const textString = getTextString(text);
  if (textString === DEFAULT_CHINESE_TEXT) {
    return { ...text, children: [{ text: '' }] };
  }

  return text;
}

const Leaf = ({ children, leaf, attributes }: any) => {
  if ((leaf as CustomText).bold) {
    children = <strong>{children}</strong>;
  }
  if ((leaf as CustomText).code) {
    children = <code>{children}</code>;
  }
  if ((leaf as CustomText).italic) {
    children = <em>{children}</em>;
  }
  if ((leaf as CustomText).underlined) {
    children = <u>{children}</u>;
  }
  return (
    <span style={{ color: (leaf as CustomText).color }} {...attributes}>
      {children}
    </span>
  );
};

const Element = (props: any) => {
  const { attributes, children, element } = props;
  const style = { textAlign: (element as ParagraphElement).align } as React.CSSProperties;
  return (
    <div style={style} {...attributes}>
      {children}
    </div>
  );
};

function TextComponent({ text: textProp, readonly, onChange, afterInit, onComposition, board, element, path }: TextWrapperProps) {
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()));
    afterInit?.(e);
    return e;
  }, []);

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  const renderElement = useCallback((props: any) => <Element {...props} />, []);

  const isLocalUpdateRef = useState(false);
  const [, setIsLocalUpdate] = isLocalUpdateRef;

  useEffect(() => {
    const normalizedText = normalizeTextValue(textProp);
    const [currentEditorChildren] = editor.children;

    if (!isLocalUpdateRef[0] && currentEditorChildren !== normalizedText) {
      editor.children = [normalizedText];
      editor.onChange();
    }
    setIsLocalUpdate(false);
  }, [textProp, editor]);

  const handleChange = (value: Descendant[]) => {
    setIsLocalUpdate(true);
    const newText = editor.children[0] as SlateElement;

    // Update the Plait element's text property to persist changes
    if (element && path) {
      PlaitTransforms.setNode(board, { text: newText }, path);
    } else {
      // Find the currently selected text element
      const selection = (board as any).selection;
      if (selection) {
        for (const [path, selectedElement] of Array.from(selection.entries())) {
          const el = selectedElement as PlaitTextElement;
          if (el.type === 'text' || el.text === textProp) {
            PlaitTransforms.setNode(board, { text: newText }, path);
            break;
          }
        }
      }
    }

    onChange?.({
      newText,
      operations: editor.operations
    });
  };

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      if (isKeyHotkey('left', event.nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: 'offset', reverse: true });
        return;
      }
      if (isKeyHotkey('right', event.nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: 'offset' });
        return;
      }
    }
  };

  return (
    <Slate
      editor={editor}
      initialValue={[normalizeTextValue(textProp)]}
      onChange={handleChange}
    >
      <Editable
        className="slate-editable-container plait-text-container"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readonly ?? true}
        onCompositionStart={(e) => onComposition?.(e as unknown as CompositionEvent)}
        onCompositionUpdate={(e) => onComposition?.(e as unknown as CompositionEvent)}
        onCompositionEnd={(e) => onComposition?.(e as unknown as CompositionEvent)}
        onKeyDown={handleKeyDown}
      />
    </Slate>
  );
}

const componentMap = new Map<string, { root: any; container: Element | DocumentFragment }>();
let renderId = 0;
let boardRef: PlaitTextBoard | null = null;

export function addTextRenderer(board: PlaitTextBoard) {
  boardRef = board;
  board.renderText = (container, props) => {
    const id = `${container}-${renderId++}`;

    const root = createRoot(container);
    componentMap.set(id, { root, container });

    root.render(<TextComponent {...props} board={boardRef as PlaitBoard} />);

    return {
      update: (newProps) => {
        root.render(<TextComponent {...newProps} board={boardRef as PlaitBoard} />);
      },
      destroy: () => {
        Promise.resolve().then(() => {
          root.unmount();
          componentMap.delete(id);
        });
      }
    };
  };
  return board;
}
