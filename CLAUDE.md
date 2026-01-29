# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thinkix is an infinite canvas whiteboard application built with Next.js 16, React 19, and the Plait board library. It provides a collaborative thinking space with support for mind maps, freehand drawing, shapes, text, and images.

## Development Commands

```bash
yarn dev      # Start development server (Turbopack, http://localhost:3000)
yarn build    # Build for production
yarn start    # Start production server
yarn lint     # Run ESLint
```

## Architecture

### Feature-Based Structure

```
features/
├── board/                    # Board canvas and state management
│   ├── components/
│   │   └── BoardCanvas.tsx   # Main canvas with Plait Wrapper + plugins
│   ├── hooks/
│   │   └── use-board-state.tsx  # Board context and tool state
│   └── plugins/
│       ├── add-image-renderer.tsx    # Image display via renderImage()
│       ├── add-emoji-renderer.tsx    # Emoji display for mind maps
│       ├── add-mind-node-resize.ts   # Width resize handles for mind nodes
│       ├── add-pen-mode.ts           # Stylus/pencil detection
│       ├── add-image-interactions.ts # Drag-drop, paste, view images
│       ├── image-component.tsx       # React image component
│       ├── emoji-component.tsx       # React emoji component
│       └── scribble/                 # Freehand drawing plugin
│
├── toolbar/                  # Toolbar UI
│   └── components/
│       └── BoardToolbar.tsx  # Tool selection and actions
│
shared/                       # Shared types and constants
├── types/                    # TypeScript types
└── constants/                # Tool mappings

components/ui/                # Shadcn-style components
app/                          # Next.js app router
```

### Plait Integration

The board uses `@plait-board/react-board@0.4.0-2` with Plait 0.92.1 packages:

**Plugins** (BoardCanvas.tsx, in order):
- `addImageRenderer` - Custom: provides `renderImage` for image display
- `withSelection` - Element selection
- `withDraw` - Drawing primitives
- `withGroup` - Grouping support
- `withMind` - Mind map creation
- `addEmojiRenderer` - Custom: provides `renderEmoji` for mind map emojis
- `addMindNodeResize` - Custom: width resize handles for mind nodes
- `withHistory` - Undo/redo
- `withHotkey` - Keyboard shortcuts
- `addPenMode` - Custom: stylus/pencil detection mode
- `addImageInteractions` - Custom: drag-drop, paste, click-to-view images
- `withScribble` - Custom: freehand drawing with smoothing

**Tool Mapping** (shared/constants/tools.ts):
```
select    → selection
hand      → hand
mind      → mind
draw      → ink (freehand)
rectangle → rectangle
ellipse   → ellipse
... etc
```

### Important Configuration

- **next.config.ts**: Transpiles `@plait-board/*` packages (required for client-side rendering)
- **tsconfig.json**: Path aliases `@/features/*`, `@/shared/*`, `@/components/*`
- **Plait packages**: Do NOT use webpack resolve aliases - causes internal dependency conflicts

### State Management

- `BoardProvider` (features/board/hooks/use-board-state.tsx) provides:
  - `board` - PlaitBoard instance
  - `state.activeTool` - Current drawing tool
  - `setActiveTool()` - Change tool, updates Plait pointer type
  - `insertImage()` - Insert image at viewport center

- Board operations use Plait APIs:
  - `getSelectedElements(board)`
  - `deleteFragment(board)`
  - `duplicateElements(board)`
  - `board.undo() / board.redo()`

### Custom Plugins

Custom plugins use an `add*` naming pattern indicating what capability they add:

**addImageRenderer** (features/board/plugins/add-image-renderer.tsx):
- Provides `board.renderImage()` for React-based image rendering
- Required by `@plait/draw`'s ImageGenerator

**addEmojiRenderer** (features/board/plugins/add-emoji-renderer.tsx):
- Provides `board.renderEmoji()` for React-based emoji rendering
- Sets mind map plugin options for emoji spacing
- Extends `withMind` functionality

**addPenMode** (features/board/plugins/add-pen-mode.ts):
- Detects stylus/pencil input (`pointerType: 'pen'`)
- Filters non-pen events when in pen mode
- Uses WeakMap for memory-safe state storage

**addMindNodeResize** (features/board/plugins/add-mind-node-resize.ts):
- 8 resize handles (corners + edges) on selected mind nodes
- Drag any handle to resize width and/or height
- Minimum size: 40x40px
- Uses `Transforms.setNode` to update dimensions

**addImageInteractions** (features/board/plugins/add-image-interactions.ts):
- Drag-drop images onto canvas
- Paste images from clipboard
- Click mind map node images to view full size
- Wraps `insertFragment`, `drop`, and `pointerUp`

**withScribble** (features/board/plugins/scribble/):
- Freehand drawing with Gaussian smoothing
- Tools: `ink` (draw) and `eraser`
- Uses Plait's `getStrokeColorByElement`, `getFillByElement`, `getStrokeWidthByElement`

### Styling

- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- OKLCH colors for light/dark theme
- Shadcn-style components using `class-variance-authority`
- Plait CSS imported via `app/styles/plait-react-board.css`

### Code Style

- Write self-documenting code; avoid excessive comments
- Use feature-based organization for scalability
- Export types from shared/ for reusability
- Prefer early returns: `if (!board) return null;`
