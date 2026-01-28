import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useBoard } from '@plait-board/react-board';
import {
  getSelectedElements,
  deleteFragment,
  duplicateElements
} from '@plait/core';
import { ThinkixTool, useThinkix } from './hooks/use-thinkix';
import { Separator } from '@/components/ui/separator';

const basicTools: { id: ThinkixTool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select' },
  { id: 'hand', icon: <Hand className="h-4 w-4" />, label: 'Pan' },
];

const shapeTools: { id: ThinkixTool; icon: React.ReactNode; label: string }[] = [
  { id: 'draw', icon: <Pencil className="h-4 w-4" />, label: 'Freehand' },
  { id: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
  { id: 'ellipse', icon: <Circle className="h-4 w-4" />, label: 'Ellipse' },
  { id: 'diamond', icon: <Diamond className="h-4 w-4" />, label: 'Diamond' },
  { id: 'triangle', icon: <Triangle className="h-4 w-4" />, label: 'Triangle' },
  { id: 'roundRectangle', icon: <Square className="h-4 w-4 rounded-md" />, label: 'Rounded Rect' },
  { id: 'parallelogram', icon: <Minus className="h-4 w-4 -rotate-12" />, label: 'Parallelogram' },
  { id: 'trapezoid', icon: <Minus className="h-4 w-4 rotate-12" />, label: 'Trapezoid' },
  { id: 'pentagon', icon: <Hexagon className="h-4 w-4" />, label: 'Pentagon' },
  { id: 'hexagon', icon: <Hexagon className="h-4 w-4" />, label: 'Hexagon' },
  { id: 'octagon', icon: <Hexagon className="h-4 w-4" />, label: 'Octagon' },
  { id: 'star', icon: <Star className="h-4 w-4" />, label: 'Star' },
  { id: 'cloud', icon: <Cloud className="h-4 w-4" />, label: 'Cloud' },
  { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
];

const otherTools: { id: ThinkixTool; icon: React.ReactNode; label: string }[] = [
  { id: 'mind', icon: <Brain className="h-4 w-4" />, label: 'Mind Map' },
  { id: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { id: 'image', icon: <ImageIcon className="h-4 w-4" />, label: 'Image' },
];

export function ThinkixToolbar() {
  const board = useBoard();
  const { state, setActiveTool, board: contextBoard } = useThinkix();
  const activeTool = state.activeTool;
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);

  // Ensure we're using the board from context, not directly from useBoard
  const activeBoard = contextBoard || board;

  // Don't render if board is not available
  if (!activeBoard) {
    return null;
  }

  const selectedElements = getSelectedElements(activeBoard);

  const isUndoDisabled = activeBoard.history ? activeBoard.history.undos.length <= 0 : true;
  const isRedoDisabled = activeBoard.history ? activeBoard.history.redos.length <= 0 : true;

  const handleToolChange = (value: string) => {
    if (!value) return;
    const tool = value as ThinkixTool;
    setActiveTool(tool);
  };

  const isShapeActive = shapeTools.some(t => t.id === activeTool);
  const activeShapeTool = shapeTools.find(t => t.id === activeTool);

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
            {basicTools.map((tool) => (
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

          <DropdownMenu open={isShapeMenuOpen} onOpenChange={setIsShapeMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isShapeActive ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                aria-label="Shapes"
              >
                {activeShapeTool ? activeShapeTool.icon : <Square className="h-4 w-4" />}
                <ChevronDown className="h-3 w-3 absolute bottom-1 right-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuContent align="center" side="bottom" className="w-48">
                    {shapeTools.map((tool) => (
                      <DropdownMenuItem
                        key={tool.id}
                        onClick={() => {
                          handleToolChange(tool.id);
                          setIsShapeMenuOpen(false);
                        }}
                        className={activeTool === tool.id ? "bg-accent" : ""}
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
            {otherTools.map((tool) => (
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
                  onClick={() => activeBoard.undo()}
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
                  onClick={() => activeBoard.redo()}
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
                      onClick={() => duplicateElements(activeBoard)}
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
                      onClick={() => deleteFragment(activeBoard)}
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
