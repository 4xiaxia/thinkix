'use client';

import { useState } from 'react';
import {
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Circle,
  Diamond,
  Triangle,
  Minus,
  ArrowRight,
  Type,
  ImageIcon,
  Undo,
  Redo,
  Copy,
  Trash2,
  Cloud,
  Hexagon,
  Star,
  ChevronDown,
} from 'lucide-react';

function MindMapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M14.5,1.5 C15.3284271,1.5 16,2.17157288 16,3 L16,4.5 C16,5.32842712 15.3284271,6 14.5,6 L10.5,6 C9.70541385,6 9.05512881,5.38217354 9.00332687,4.60070262 L7.75,4.6 C6.70187486,4.6 5.75693372,5.0417832 5.09122946,5.7492967 L5.5,5.75 C6.32842712,5.75 7,6.42157288 7,7.25 L7,8.75 C7,9.57842712 6.32842712,10.25 5.5,10.25 L4.69703093,10.2512226 C5.3493111,11.2442937 6.47308134,11.9 7.75,11.9 L9.004,11.9 L9.00686658,11.85554 C9.07955132,11.0948881 9.72030388,10.5 10.5,10.5 L14.5,10.5 C15.3284271,10.5 16,11.1715729 16,12 L16,13.5 C16,14.3284271 15.3284271,15 14.5,15 L10.5,15 C9.67157288,15 9,14.3284271 9,13.5 L9,13.1 L7.75,13.1 C5.78479628,13.1 4.09258608,11.9311758 3.33061658,10.2507745 L1.5,10.25 C0.671572875,10.25 0,9.57842712 0,8.75 L0,7.25 C0,6.42157288 0.671572875,5.75 1.5,5.75 L3.5932906,5.74973863 C4.44206161,4.34167555 5.98606075,3.4 7.75,3.4 L9,3.4 L9,3 C9,2.17157288 9.67157288,1.5 10.5,1.5 L14.5,1.5 Z M14.5,11.7 L10.5,11.7 C10.3343146,11.7 10.2,11.8343146 10.2,12 L10.2,13.5 C10.2,13.6656854 10.3343146,13.8 10.5,13.8 L14.5,13.8 C14.6656854,13.8 14.8,13.6656854 14.8,13.5 L14.8,12 C14.8,11.8343146 14.6656854,11.7 14.5,11.7 Z M5.5,6.95 L1.5,6.95 C1.33431458,6.95 1.2,7.08431458 1.2,7.25 L1.2,8.75 C1.2,8.91568542 1.33431458,9.05 1.5,9.05 L5.5,9.05 C5.66568542,9.05 5.8,8.91568542 5.8,8.75 L5.8,7.25 C5.8,7.08431458 5.66568542,6.95 5.5,6.95 Z M14.5,2.7 L10.5,2.7 C10.3343146,2.7 10.2,2.83431458 10.2,3 L10.2,4.5 C10.2,4.66568542 10.3343146,4.8 10.5,4.8 L14.5,4.8 C14.6656854,4.8 14.8,4.66568542 14.8,4.5 L14.8,3 C14.8,2.83431458 14.6656854,2.7 14.5,2.7 Z" />
    </svg>
  );
}

import { useBoard } from '@plait-board/react-board';
import {
  getSelectedElements,
  deleteFragment,
  duplicateElements,
} from '@plait/core';
import { Button } from '@thinkix/ui';
import { ToggleGroup, ToggleGroupItem } from '@thinkix/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@thinkix/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@thinkix/ui';
import { useBoardState } from '@/features/board/hooks/use-board-state';
import type { DrawingTool } from '@/shared/types';
import {
  SELECTION_TOOLS,
  NAVIGATION_TOOLS,
  SHAPE_TOOLS,
  OTHER_TOOLS,
} from '@/shared/constants';

interface ToolConfig {
  id: DrawingTool;
  icon: React.ReactNode;
  label: string;
}

const BASIC_TOOLS: ToolConfig[] = [
  { id: 'select', icon: <MousePointer2 className="h-6 w-6" />, label: 'Select' },
  { id: 'hand', icon: <Hand className="h-6 w-6" />, label: 'Pan' },
];

const SHAPE_TOOL_CONFIGS: ToolConfig[] = [
  { id: 'draw', icon: <Pencil className="h-6 w-6" />, label: 'Freehand' },
  { id: 'rectangle', icon: <Square className="h-6 w-6" />, label: 'Rectangle' },
  { id: 'ellipse', icon: <Circle className="h-6 w-6" />, label: 'Ellipse' },
  { id: 'diamond', icon: <Diamond className="h-6 w-6" />, label: 'Diamond' },
  { id: 'triangle', icon: <Triangle className="h-6 w-6" />, label: 'Triangle' },
  {
    id: 'roundRectangle',
    icon: <Square className="h-4 w-4 rounded-[2px]" />,
    label: 'Rounded Rect',
  },
  {
    id: 'parallelogram',
    icon: <Minus className="h-4 w-4 -rotate-12" />,
    label: 'Parallelogram',
  },
  { id: 'trapezoid', icon: <Minus className="h-4 w-4 rotate-12" />, label: 'Trapezoid' },
  { id: 'pentagon', icon: <Hexagon className="h-6 w-6" />, label: 'Pentagon' },
  { id: 'hexagon', icon: <Hexagon className="h-6 w-6" />, label: 'Hexagon' },
  { id: 'octagon', icon: <Hexagon className="h-6 w-6" />, label: 'Octagon' },
  { id: 'star', icon: <Star className="h-6 w-6" />, label: 'Star' },
  { id: 'cloud', icon: <Cloud className="h-6 w-6" />, label: 'Cloud' },
  { id: 'arrow', icon: <ArrowRight className="h-6 w-6" />, label: 'Arrow' },
];

const OTHER_TOOL_CONFIGS: ToolConfig[] = [
  { id: 'mind', icon: <MindMapIcon className="h-6 w-6" />, label: 'Mind Map' },
  { id: 'text', icon: <Type className="h-6 w-6" />, label: 'Text' },
  { id: 'image', icon: <ImageIcon className="h-6 w-6" />, label: 'Image' },
];

const TOOLBAR_ITEM_CLASS =
  'h-12 w-12 rounded-lg p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground';

const BUTTON_CLASS = 'h-12 w-12 rounded-lg p-0';

export function BoardToolbar() {
  const board = useBoard();
  const { state, setActiveTool } = useBoardState();
  const activeTool = state.activeTool;
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);

  if (!board) return null;

  const selectedElements = getSelectedElements(board);
  const isUndoDisabled = board.history ? board.history.undos.length === 0 : true;
  const isRedoDisabled = board.history ? board.history.redos.length === 0 : true;

  const handleToolChange = (value: string) => {
    if (!value) return;
    setActiveTool(value as DrawingTool);
  };

  const isShapeActive = SHAPE_TOOLS.some((t) => t === activeTool);
  const activeShapeTool = SHAPE_TOOL_CONFIGS.find((t) => t.id === activeTool);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="inline-flex items-center gap-0.5 rounded-lg border bg-background/95 backdrop-blur p-1.5 shadow-lg">
          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={handleToolChange}
          >
            {BASIC_TOOLS.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={tool.id}
                    aria-label={tool.label}
                    className={TOOLBAR_ITEM_CLASS}
                  >
                    {tool.icon}
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>

          <div className="mx-1 h-7 w-px bg-border" />

          <DropdownMenu
            open={isShapeMenuOpen}
            onOpenChange={setIsShapeMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant={isShapeActive ? 'default' : 'ghost'}
                size="icon"
                className={BUTTON_CLASS}
                aria-label="Shapes"
              >
                {activeShapeTool ? (
                  activeShapeTool.icon
                ) : (
                  <Square className="h-6 w-6" />
                )}
                <ChevronDown className="h-2.5 w-2.5 absolute bottom-0.5 right-0.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="bottom"
              className="w-44"
            >
              {SHAPE_TOOL_CONFIGS.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => {
                    handleToolChange(tool.id);
                    setIsShapeMenuOpen(false);
                  }}
                  className={activeTool === tool.id ? 'bg-accent' : ''}
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{tool.icon}</span>
                    <span>{tool.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1 h-7 w-px bg-border" />

          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={handleToolChange}
          >
            {OTHER_TOOL_CONFIGS.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={tool.id}
                    aria-label={tool.label}
                    className={TOOLBAR_ITEM_CLASS}
                  >
                    {tool.icon}
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>

          <div className="mx-1 h-7 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={BUTTON_CLASS}
                disabled={isUndoDisabled}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  board.undo();
                }}
              >
                <Undo className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={BUTTON_CLASS}
                disabled={isRedoDisabled}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  board.redo();
                }}
              >
                <Redo className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>

          {selectedElements.length > 0 && (
            <>
              <div className="mx-1 h-5 w-px bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={BUTTON_CLASS}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      duplicateElements(board);
                    }}
                  >
                    <Copy className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Duplicate</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${BUTTON_CLASS} hover:bg-destructive/10 hover:text-destructive`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteFragment(board);
                    }}
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
