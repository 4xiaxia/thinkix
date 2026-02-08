# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thinkix is an infinite canvas whiteboard application built with Next.js 16, React 19, and the Plait board library. It provides a collaborative thinking space with support for mind maps, freehand drawing, shapes, text, and images. The project uses an NX-style monorepo with workspace packages for shared code.

## Development Commands

```bash
bun dev       # Start development server (Turbopack, http://localhost:3000)
bun run build # Build for production
bun start     # Start production server
bun run lint  # Run ESLint
bun install   # Install workspace dependencies
```

**Note:** This project uses Bun as the package manager and runtime. Install Bun from [bun.sh](https://bun.sh).

## Monorepo Structure

The project uses Bun workspaces with the following structure:

```
thinkix/
├── packages/              # Workspace packages
│   ├── ui/               # @thinkix/ui - Shared UI components (shadcn-based)
│   ├── ai/               # @thinkix/ai - AI SDK integration and utilities
│   └── plait-utils/      # @thinkix/plait-utils - Plait board helpers
│
├── features/             # Feature modules (board, toolbar, etc.)
├── app/                  # Next.js app router and API routes
└── shared/               # Shared types and constants
```

### Workspace Packages

**@thinkix/ui** (`packages/ui/`)
- Shared React components built on shadcn/ui patterns
- Exports: Button, Tooltip, Separator, Toggle, ToggleGroup, DropdownMenu, ImageViewer
- Utilities: `cn()` class merge function
- Import: `import { Button } from '@thinkix/ui';`

**@thinkix/ai** (`packages/ai/`)
- Vercel AI SDK integration with multi-provider support
- Exports: `MODELS`, `createAIProvider()`, `executeCommand()`
- Types: `AIProvider`, `AIModel`, `UserSettings`, `CanvasCommand`
- Import: `import { MODELS, createAIProvider } from '@thinkix/ai';`

**@thinkix/plait-utils** (`packages/plait-utils/`)
- Helper functions for Plait board operations
- Exports: `getSelectedMindElements()`, `getCanvasContext()`, `findElementById()`
- Import: `import { getCanvasContext } from '@thinkix/plait-utils';`

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
│       ├── add-text-renderer.tsx     # Custom Slate-based text editor
│       ├── image-component.tsx       # React image component
│       ├── emoji-component.tsx       # React emoji component
│       └── scribble/                 # Freehand drawing plugin
│
├── toolbar/                  # Toolbar UI
│   └── components/
│       └── BoardToolbar.tsx  # Tool selection and actions

shared/                       # Shared types and constants
├── types/                    # TypeScript types
└── constants/                # Tool mappings

app/                          # Next.js app router and API routes
├── api/
│   ├── chat/                # AI chat streaming endpoint
│   └── structure/           # Content-to-mindmap structure endpoint
```

### Plait Integration

The board uses `@plait-board/react-board@0.4.0-2` with Plait 0.92.1 packages:

**Plugins** (BoardCanvas.tsx, in order):
- `addImageRenderer` - Custom: provides `renderImage` for image display
- `withText` - Text editing support from `@plait/common`
- `addTextRenderer` - Custom: Slate-based text editor with auto-resize
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

### Custom Text Renderer

**IMPORTANT**: The project uses a custom Slate-based text renderer (`features/board/plugins/add-text-renderer.tsx`) instead of `@plait-board/react-text`.

**Why custom?**
- Fixes text typing persistence issue (React 19 + root.render() incompatibility)
- Removes default Chinese text ("文本") on new text elements
- Provides full control over editor lifecycle and state management

**How it works:**
- Creates a persistent Slate editor instance via `useMemo(() => withHistory(withReact(createEditor())), [])`
- Uses local update tracking to prevent external prop changes from overwriting user typing
- Normalizes null/invalid text values to prevent Slate errors
- Replaces "文本" with empty string for new text elements

**Text element properties:**
- `autoSize: true` - Elements automatically resize to fit text content
- Text elements use Slate JSON format: `{ children: [{ text: 'content' }] }`

**If modifying text rendering:**
- The `onChange` callback must include `newText` and `operations`
- Editor instance must persist across renders (empty deps in useMemo)
- Local update flag prevents infinite loops during external prop updates

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

**addTextRenderer** (features/board/plugins/add-text-renderer.tsx):
- Custom Slate-based text editor implementation
- Provides `board.renderText()` for text element rendering
- Handles text normalization (null values, Chinese default text)
- Manages editor state persistence across React re-renders

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

## Adding New Workspace Packages

To create a new workspace package:

1. Create the package directory:
   ```bash
   mkdir -p packages/new-package/lib
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@thinkix/new-package",
     "version": "0.0.1",
     "private": true,
     "type": "module",
     "main": "./lib/index.ts",
     "types": "./lib/index.d.ts",
     "exports": {
       ".": "./lib/index.ts"
     },
     "scripts": {
       "typecheck": "tsc --noEmit"
     },
     "dependencies": {},
     "devDependencies": {
       "typescript": "^5"
     }
   }
   ```

3. Create `tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "composite": true,
       "outDir": "./dist",
       "rootDir": "./lib"
     },
     "include": ["lib/**/*"],
     "references": []
   }
   ```

4. Add reference to root `tsconfig.json`:
   ```json
   "references": [
     { "path": "./packages/new-package" }
   ]
   ```

5. Run `bun install` to link the workspace package

6. Import from anywhere in the app:
   ```ts
   import { something } from '@thinkix/new-package';
   ```

## Known Issues & Solutions

### Text Editor with Slate
- **Issue**: React 19's `root.render()` can reset component state, causing text to be lost
- **Solution**: Custom text renderer with persistent editor instance and local update tracking
- **Do NOT**: Switch to `@plait-board/react-text` or attempt to use Lexical (deeply integrated with Slate)

### Default Chinese Text
- **Issue**: New text elements show "文本" (Chinese for "text")
- **Solution**: `normalizeTextValue()` function replaces with empty string
