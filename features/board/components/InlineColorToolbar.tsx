'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useBoard } from '@plait-board/react-board';
import {
  getSelectedElements,
  PlaitElement,
  getRectangleByElements,
  RectangleClient,
  toHostPointFromViewBoxPoint,
  toScreenPointFromHostPoint,
  isDragging,
  isMovingElements,
  isSelectionMoving,
  PlaitBoard,
  Path,
  Transforms,
  ATTACHED_ELEMENT_CLASS_NAME,
} from '@plait/core';
import { PropertyTransforms } from '@plait/common';
import { applyTextMark, applyTextColor, applyFontSize, getTextMarks } from '../plugins/text-transforms';
import {
  PlaitDrawElement,
  getStrokeColorByElement as getStrokeColorByDrawElement,
  isClosedDrawElement,
  isDrawElementsIncludeText,
} from '@plait/draw';
import {
  MindElement,
  getStrokeColorByElement as getStrokeColorByMindElement,
  getFillByElement as getFillByMindElement,
} from '@plait/mind';
import { isNoColor } from '@thinkix/ui';
import { cn } from '@thinkix/ui';
import { useFloating, flip, offset } from '@floating-ui/react';
import { getMemorizeKey } from '@plait/draw';
import {
  PaintBucket,
  Pencil,
  Type as TypeIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ChevronDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@thinkix/ui';
import { Button } from '@thinkix/ui';
import { Separator } from '@thinkix/ui';
import { Slider } from '@thinkix/ui';

interface ElementColors {
  fill: string;
  stroke: string;
  strokeWidth: number;
  text: string;
  textMarks: {
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strike?: boolean;
    'font-size'?: string;
  };
}

const FONT_SIZE_OPTIONS = [
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
  { value: '24', label: '24' },
  { value: '28', label: '28' },
  { value: '32', label: '32' },
];

function getElementColors(board: PlaitBoard, elements: PlaitElement[]): ElementColors | null {
  if (elements.length === 0) return null;

  const first = elements[0];
  let fill = first.fill;
  let stroke = (first as any).strokeColor;

  if (!fill) {
    if (MindElement.isMindElement(board, first)) {
      fill = getFillByMindElement(board, first as MindElement);
    } else if (PlaitDrawElement.isDrawElement(first)) {
      fill = (first as any).fill;
    }
  }

  if (!stroke) {
    if (MindElement.isMindElement(board, first)) {
      stroke = getStrokeColorByMindElement(board, first as MindElement);
    } else if (PlaitDrawElement.isDrawElement(first)) {
      stroke = getStrokeColorByDrawElement(board, first);
    }
  }

  const textMarks = getTextMarks(first, board);
  const textColor = textMarks?.color || '';

  const colors: ElementColors = {
    fill: fill || '',
    stroke: stroke || '',
    strokeWidth: (first as any).strokeWidth || 2,
    text: textColor,
    textMarks: {
      bold: textMarks?.bold,
      italic: textMarks?.italic,
      underlined: textMarks?.underlined,
      strike: textMarks?.strike,
      'font-size': textMarks?.['font-size'],
    },
  };

  for (let i = 1; i < elements.length; i++) {
    const el = elements[i];
    if (el.fill !== colors.fill) colors.fill = '';
    if ((el as any).strokeColor !== colors.stroke) colors.stroke = '';
    if ((el as any).strokeWidth !== colors.strokeWidth) colors.strokeWidth = 0;
    const elTextMarks = getTextMarks(el, board);
    const elTextColor = elTextMarks?.color || '';
    if (elTextColor !== colors.text) colors.text = '';
    if (elTextMarks?.bold !== colors.textMarks.bold) colors.textMarks.bold = undefined;
    if (elTextMarks?.italic !== colors.textMarks.italic) colors.textMarks.italic = undefined;
    if (elTextMarks?.underlined !== colors.textMarks.underlined) colors.textMarks.underlined = undefined;
    if (elTextMarks?.strike !== colors.textMarks.strike) colors.textMarks.strike = undefined;
    if (elTextMarks?.['font-size'] !== colors.textMarks['font-size']) colors.textMarks['font-size'] = undefined;
  }

  return colors;
}

function hasClosedShape(board: PlaitBoard, elements: PlaitElement[]): boolean {
  return elements.some((el) => {
    if (MindElement.isMindElement(board, el)) return true;
    if (PlaitDrawElement.isDrawElement(el)) {
      return isClosedDrawElement(el);
    }
    return ['rectangle', 'ellipse', 'diamond', 'triangle', 'roundRectangle', 'polygon', 'image'].includes(
      (el as any).type
    );
  });
}

function hasStrokeProperty(board: PlaitBoard, elements: PlaitElement[]): boolean {
  return elements.some((el) => {
    if (MindElement.isMindElement(board, el)) return true;
    if (PlaitDrawElement.isDrawElement(el)) {
      return !PlaitDrawElement.isImage(el);
    }
    return ['rectangle', 'ellipse', 'diamond', 'triangle', 'roundRectangle', 'polygon'].includes(
      (el as any).type
    );
  });
}

function hasTextProperty(board: PlaitBoard, elements: PlaitElement[]): boolean {
  return elements.some((el) => {
    if (MindElement.isMindElement(board, el)) return true;

    if (PlaitDrawElement.isDrawElement(el)) {
      if (PlaitDrawElement.isText(el)) return true;
      if (PlaitDrawElement.isShapeElement(el) && !PlaitDrawElement.isImage(el)) {
        return true;
      }
      return isDrawElementsIncludeText([el]);
    }

    return false;
  });
}

const INLINE_COLORS = [
  '#FF1313', '#FF9900', '#FFD700', '#A5D65A', '#5CB85C', '#01A3A4',
  '#0078D7', '#5B2FC6', '#E84A7F', '#999999', '#666666', '#e7e7e7',
];

const NO_COLOR_SWATCH = '#e7e7e7';

const NO_COLOR_PATTERN_SMALL = {
  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '4px 4px',
  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
};

const NO_COLOR_PATTERN_LARGE = {
  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
};

function ColorSwatch({
  color,
  isSelected,
  onPointerDown,
}: {
  color: string;
  isSelected: boolean;
  onPointerDown: () => void;
}) {
  const isNoColor = color === NO_COLOR_SWATCH;

  return (
    <button
      type="button"
      className={cn(
        'relative rounded transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isNoColor && 'bg-background'
      )}
      style={{
        width: 22,
        height: 22,
        backgroundColor: isNoColor ? undefined : color,
        ...(isNoColor ? NO_COLOR_PATTERN_LARGE : {}),
        boxShadow: isSelected ? '0 0 0 2px var(--ring)' : undefined,
        border: isSelected ? 'none' : '1px solid var(--border)',
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPointerDown();
      }}
    >
      {isSelected && !isNoColor && (
        <svg className="absolute inset-0 h-full w-full p-0.5 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function ColorPaletteGroup({
  icon: Icon,
  label,
  currentColor,
  colors,
  onSelect,
  showStrokeWidth = false,
  strokeWidth = 2,
  onStrokeWidthChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  currentColor: string;
  colors: string[];
  onSelect: (color: string) => void;
  showStrokeWidth?: boolean;
  strokeWidth?: number;
  onStrokeWidthChange?: (width: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentClickRef = useRef(false);

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    // Don't close if a color was just clicked (prevents race condition)
    if (recentClickRef.current) {
      recentClickRef.current = false;
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleColorSelect = (color: string) => {
    recentClickRef.current = true;
    onSelect(color);
    setTimeout(() => {
      setIsOpen(false);
      recentClickRef.current = false;
    }, 100);
  };

  return (
    <div
      className="relative flex items-center gap-1"
      onPointerEnter={handleOpen}
      onPointerLeave={handleClose}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-7 w-7 shrink-0 p-0"
          >
            <div
              className="absolute inset-0.5 rounded-sm"
              style={{
                backgroundColor: isNoColor(currentColor) ? 'transparent' : currentColor,
                ...(isNoColor(currentColor) ? NO_COLOR_PATTERN_SMALL : {}),
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>

      <div
        className={cn(
          'rounded-lg border bg-background/95 backdrop-blur p-2 shadow-lg transition-all duration-150 absolute top-full left-0 mt-2 z-50 min-w-fit',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onPointerEnter={handleOpen}
        onPointerLeave={handleClose}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-1">
              {colors.map((color) => {
                const isSelected = color === NO_COLOR_SWATCH
                  ? isNoColor(currentColor)
                  : currentColor === color;
                return (
                  <ColorSwatch
                    key={color}
                    color={color}
                    isSelected={isSelected}
                    onPointerDown={() => handleColorSelect(color)}
                  />
                );
              })}
            </div>
          </div>

          {showStrokeWidth && onStrokeWidthChange && (
            <div className="flex items-center gap-2 min-w-[140px]">
              <span className="text-xs text-muted-foreground w-8">{strokeWidth}</span>
              <Slider
                value={[strokeWidth]}
                onValueChange={([value]) => onStrokeWidthChange(value)}
                min={1}
                max={20}
                step={1}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FontSizeDropdown({
  currentFontSize,
  onSelect,
}: {
  currentFontSize: string;
  onSelect: (size: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside as EventListener);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (size: string) => {
    onSelect(size);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={handleOpen}
      onPointerLeave={handleClose}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 min-w-[50px]"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <span className="text-xs font-medium">
              {currentFontSize || '16'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Font Size</p>
        </TooltipContent>
      </Tooltip>

      <div
        className={cn(
          'rounded-lg border bg-background/95 backdrop-blur p-1 shadow-lg transition-all duration-150 absolute top-full left-0 mt-1 z-50 min-w-fit',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerEnter={handleOpen}
        onPointerLeave={handleClose}
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            className={cn(
              'relative flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm outline-none transition-colors w-full text-left',
              'hover:bg-accent hover:text-accent-foreground',
              currentFontSize === option.value && 'bg-accent text-accent-foreground'
            )}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InlineColorToolbar() {
  const board = useBoard();
  const [movingOrDragging, setMovingOrDragging] = useState(false);
  const movingOrDraggingRef = useRef(movingOrDragging);
  const [colors, setColors] = useState<ElementColors | null>(null);

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    middleware: useMemo(() => [offset(8), flip()], []),
  });

  useEffect(() => {
    movingOrDraggingRef.current = movingOrDragging;
  }, [movingOrDragging]);

  useEffect(() => {
    if (!board) return;
    
    const { pointerUp, pointerMove } = board;

    board.pointerMove = (event: PointerEvent) => {
      if (
        (isMovingElements(board) || isDragging(board)) &&
        !movingOrDraggingRef.current
      ) {
        setMovingOrDragging(true);
      }
      pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
      if (
        movingOrDraggingRef.current &&
        (isMovingElements(board) || isDragging(board))
      ) {
        setMovingOrDragging(false);
      }
      pointerUp(event);
    };

    return () => {
      board.pointerUp = pointerUp;
      board.pointerMove = pointerMove;
    };
  }, [board]);

  const selectedElements = board ? getSelectedElements(board) : [];
  const hasSelectionNow = selectedElements.length > 0 &&
    board &&
    !isSelectionMoving(board) &&
    !movingOrDragging;

  const hasFill = hasSelectionNow && board && hasClosedShape(board, selectedElements) && !PlaitBoard.hasBeenTextEditing(board);
  const hasStroke = hasSelectionNow && board && hasStrokeProperty(board, selectedElements) && !PlaitBoard.hasBeenTextEditing(board);
  const hasText = hasSelectionNow && board && hasTextProperty(board, selectedElements);

  const showToolbar = hasSelectionNow && board && !PlaitBoard.hasBeenTextEditing(board);

  useEffect(() => {
    if (!hasSelectionNow || !board) return;

    const elements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, elements, false);
    const [start, end] = RectangleClient.getPoints(rectangle);
    const screenStart = toScreenPointFromHostPoint(
      board,
      toHostPointFromViewBoxPoint(board, start)
    );
    const screenEnd = toScreenPointFromHostPoint(
      board,
      toHostPointFromViewBoxPoint(board, end)
    );
    const width = screenEnd[0] - screenStart[0];
    const height = screenEnd[1] - screenStart[1];

    const virtualEl = {
      getBoundingClientRect() {
        return {
          width,
          height,
          x: screenStart[0],
          y: screenStart[1],
          top: screenStart[1],
          left: screenStart[0],
          right: screenStart[0] + width,
          bottom: screenStart[1] + height,
        };
      },
    };

    refs.setPositionReference(virtualEl as any);

    const elementColors = getElementColors(board, elements);
    setColors(elementColors);
  }, [board?.viewport, board?.selection, hasSelectionNow, movingOrDragging, refs]);

  const handleFillChange = (color: string) => {
    const fillColor = color === NO_COLOR_SWATCH || isNoColor(color) ? null : color;

    PropertyTransforms.setFillColor(board, null, {
      getMemorizeKey,
      callback: (element: PlaitElement, path: Path) => {
        if (MindElement.isMindElement(board, element)) {
          Transforms.setNode(board, { fill: fillColor }, path);
        } else if (PlaitDrawElement.isDrawElement(element)) {
          if (isClosedDrawElement(element)) {
            Transforms.setNode(board, { fill: fillColor }, path);
          }
        } else if (hasClosedShape(board, [element])) {
          Transforms.setNode(board, { fill: fillColor }, path);
        }
      },
    });
  };

  const handleStrokeChange = (color: string) => {
    const strokeColor = color === NO_COLOR_SWATCH || isNoColor(color) ? null : color;

    PropertyTransforms.setStrokeColor(board, null, {
      getMemorizeKey,
      callback: (element: PlaitElement, path: Path) => {
        if (MindElement.isMindElement(board, element)) {
          Transforms.setNode(board, { strokeColor }, path);
        } else if (PlaitDrawElement.isDrawElement(element)) {
          if (!PlaitDrawElement.isImage(element)) {
            Transforms.setNode(board, { strokeColor }, path);
          }
        } else if (hasStrokeProperty(board, [element])) {
          Transforms.setNode(board, { strokeColor }, path);
        }
      },
    });
  };

  const handleStrokeWidthChange = (width: number) => {
    PropertyTransforms.setStrokeWidth(board, width, {
      getMemorizeKey,
    });
  };

  const handleTextChange = (color: string) => {
    const newColor = isNoColor(color) ? null : color;
    applyTextColor(board, newColor);
    setTimeout(() => {
      const elements = getSelectedElements(board);
      const updated = getElementColors(board, elements);
      if (updated) setColors(updated);
    }, 0);
  };

  const toggleMark = (mark: 'bold' | 'italic' | 'underlined' | 'strike') => {
    applyTextMark(board, mark);
    setTimeout(() => {
      const elements = getSelectedElements(board);
      const updated = getElementColors(board, elements);
      if (updated) setColors(updated);
    }, 0);
  };

  const setFontSize = (size: string) => {
    applyFontSize(board, size);
    setTimeout(() => {
      const elements = getSelectedElements(board);
      const updated = getElementColors(board, elements);
      if (updated) setColors(updated);
    }, 0);
  };

  if (!showToolbar || !colors) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-lg border bg-background/95 backdrop-blur p-1.5 shadow-lg',
          ATTACHED_ELEMENT_CLASS_NAME
        )}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {hasFill && (
          <ColorPaletteGroup
            icon={PaintBucket}
            label="Fill"
            currentColor={colors.fill}
            colors={INLINE_COLORS}
            onSelect={handleFillChange}
          />
        )}

        {hasStroke && (
          <>
            {hasFill && <Separator orientation="vertical" className="mx-1 h-6" />}
            <ColorPaletteGroup
              icon={Pencil}
              label="Stroke"
              currentColor={colors.stroke}
              colors={INLINE_COLORS}
              onSelect={handleStrokeChange}
              showStrokeWidth
              strokeWidth={colors.strokeWidth || 2}
              onStrokeWidthChange={handleStrokeWidthChange}
            />
          </>
        )}

        {hasText && (
          <>
            {(hasFill || hasStroke) && <Separator orientation="vertical" className="mx-1 h-6" />}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-7 w-7 p-0',
                      colors.textMarks.bold && 'bg-accent text-accent-foreground'
                    )}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMark('bold');
                    }}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Bold</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-7 w-7 p-0',
                      colors.textMarks.italic && 'bg-accent text-accent-foreground'
                    )}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMark('italic');
                    }}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Italic</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-7 w-7 p-0',
                      colors.textMarks.underlined && 'bg-accent text-accent-foreground'
                    )}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMark('underlined');
                    }}
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Underline</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-7 w-7 p-0',
                      colors.textMarks.strike && 'bg-accent text-accent-foreground'
                    )}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMark('strike');
                    }}
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Strikethrough</p>
                </TooltipContent>
              </Tooltip>

              <FontSizeDropdown
                currentFontSize={colors.textMarks['font-size'] || '16'}
                onSelect={(size) => {
                  setFontSize(size);
                }}
              />

              <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
                <ColorPaletteGroup
                  icon={TypeIcon}
                  label="Text Color"
                  currentColor={colors.text}
                  colors={INLINE_COLORS}
                  onSelect={handleTextChange}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
