'use client';

import { useState } from 'react';
import {
  MousePointer2,
  Hand,
  Brain,
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
import { useBoard } from '@plait-board/react-board';
import {
  getSelectedElements,
  deleteFragment,
  duplicateElements,
} from '@plait/core';
import { Button } from '@thinkix/ui';
import { ToggleGroup, ToggleGroupItem } from '@thinkix/ui';
import { Separator } from '@thinkix/ui';
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
  { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select' },
  { id: 'hand', icon: <Hand className="h-4 w-4" />, label: 'Pan' },
];

const SHAPE_TOOL_CONFIGS: ToolConfig[] = [
  { id: 'draw', icon: <Pencil className="h-4 w-4" />, label: 'Freehand' },
  { id: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
  { id: 'ellipse', icon: <Circle className="h-4 w-4" />, label: 'Ellipse' },
  { id: 'diamond', icon: <Diamond className="h-4 w-4" />, label: 'Diamond' },
  { id: 'triangle', icon: <Triangle className="h-4 w-4" />, label: 'Triangle' },
  {
    id: 'roundRectangle',
    icon: <Square className="h-4 w-4 rounded-md" />,
    label: 'Rounded Rect',
  },
  {
    id: 'parallelogram',
    icon: <Minus className="h-4 w-4 -rotate-12" />,
    label: 'Parallelogram',
  },
  { id: 'trapezoid', icon: <Minus className="h-4 w-4 rotate-12" />, label: 'Trapezoid' },
  { id: 'pentagon', icon: <Hexagon className="h-4 w-4" />, label: 'Pentagon' },
  { id: 'hexagon', icon: <Hexagon className="h-4 w-4" />, label: 'Hexagon' },
  { id: 'octagon', icon: <Hexagon className="h-4 w-4" />, label: 'Octagon' },
  { id: 'star', icon: <Star className="h-4 w-4" />, label: 'Star' },
  { id: 'cloud', icon: <Cloud className="h-4 w-4" />, label: 'Cloud' },
  { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
];

const OTHER_TOOL_CONFIGS: ToolConfig[] = [
  { id: 'mind', icon: <Brain className="h-4 w-4" />, label: 'Mind Map' },
  { id: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { id: 'image', icon: <ImageIcon className="h-4 w-4" />, label: 'Image' },
];

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
        <div className="flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 shadow-lg">
          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={handleToolChange}
            className="flex gap-0.5"
          >
            {BASIC_TOOLS.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={tool.id}
                    aria-label={tool.label}
                    className="h-9 w-9 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
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

          <Separator orientation="vertical" className="h-6 mx-1" />

          <DropdownMenu
            open={isShapeMenuOpen}
            onOpenChange={setIsShapeMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant={isShapeActive ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                aria-label="Shapes"
              >
                {activeShapeTool ? (
                  activeShapeTool.icon
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <ChevronDown className="h-3 w-3 absolute bottom-1 right-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuContent
                    align="center"
                    side="bottom"
                    className="w-48"
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
                          {tool.icon}
                          <span>{tool.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Shapes</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={handleToolChange}
            className="flex gap-0.5"
          >
            {OTHER_TOOL_CONFIGS.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={tool.id}
                    aria-label={tool.label}
                    className="h-9 w-9 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
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

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={isUndoDisabled}
                  onClick={() => board.undo()}
                >
                  <Undo className="h-4 w-4" />
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
                  className="h-9 w-9"
                  disabled={isRedoDisabled}
                  onClick={() => board.redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>

            {selectedElements.length > 0 && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => duplicateElements(board)}
                    >
                      <Copy className="h-4 w-4" />
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
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteFragment(board)}
                    >
                      <Trash2 className="h-4 w-4" />
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
      </div>
    </TooltipProvider>
  );
}
