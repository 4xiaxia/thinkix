# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thinkix is an infinite canvas whiteboard application built with Next.js 16, React 19, and the Plait board library. It provides a collaborative thinking space with support for mind maps, freehand drawing, shapes, text, and images. The project uses Bun workspaces for shared code.

## Development Commands

```bash
bun dev           # Start development server (Turbopack, http://localhost:3000)
bun run build     # Build for production
bun start         # Start production server
bun run lint      # Run ESLint
bun run typecheck # Run TypeScript type checking
bun install       # Install workspace dependencies
bun run build:parser # Build Peggy DSL parser

# Testing
bun test          # Run tests in watch mode
bun run test:run  # Run tests once
bun run test:coverage # Run tests with coverage report
```

**Note:** This project uses Bun as the package manager and runtime. Install Bun from [bun.sh](https://bun.sh).

## Monorepo Structure

The project uses Bun workspaces with the following structure:

```text
thinkix/
├── packages/              # Workspace packages
│   ├── ui/               # @thinkix/ui - Shared UI components (shadcn-based)
│   ├── ai/               # @thinkix/ai - AI SDK integration and utilities
│   ├── plait-utils/      # @thinkix/plait-utils - Plait board helpers
│   ├── storage/          # @thinkix/storage - IndexedDB storage
│   ├── shared/           # @thinkix/shared - Shared types
│   └── file-utils/       # @thinkix/file-utils - File I/O and board export
│
├── features/             # Feature modules (board, toolbar, storage)
├── app/                  # Next.js app router and API routes
├── shared/               # Shared constants with JSX (icons, tool configs)
└── tests/                # Test files (unit, integration, components)
```

### Workspace Packages

**@thinkix/ui** (`packages/ui/`)
- Shared React components built on shadcn/ui patterns
- Exports: Button, Tooltip, Separator, Toggle, ToggleGroup, DropdownMenu, ImageViewer, Dialog, Input
- Utilities: `cn()` class merge function
- Import: `import { Button } from '@thinkix/ui';`

**@thinkix/ai** (`packages/ai/`)
- AI SDK v5 integration with multi-provider support (OpenAI, Anthropic)
- Exports: `createAIProvider()`, `resolveAIProvider()`, `resolveAIModel()`, `resolveAIKey()`, `getClientAIConfig()`, `toolSchemas`
- Types: `AIProvider`, `ProviderConfig`, `ClientAIConfig`
- Sub-exports: `@thinkix/ai/tool-schemas`, `@thinkix/ai/prompts`
- Import: `import { createAIProvider, resolveAIProvider, toolSchemas } from '@thinkix/ai';`

**@thinkix/plait-utils** (`packages/plait-utils/`)
- Helper functions for Plait board operations
- Exports: `getSelectedElements()`, `getSelectedMindElements()`, `getCanvasContext()`, `findElementById()`
- Import: `import { getCanvasContext } from '@thinkix/plait-utils';`

**@thinkix/storage** (`packages/storage/`)
- IndexedDB-based board storage with Dexie
- Exports: `useBoardStore`, types: `Board`, `BoardMetadata`, `SaveStatus`
- Import: `import { useBoardStore } from '@thinkix/storage';`

**@thinkix/shared** (`packages/shared/`)
- TypeScript types for the application
- Exports: `DrawingTool`, `ToolConfig`, `BoardState`, `BoardContextValue`
- Import: `import type { DrawingTool } from '@thinkix/shared';`

**@thinkix/file-utils** (`packages/file-utils/`)
- File system operations and board export utilities
- Exports: `fileOpen`, `fileSave`, `parseFileContents`, `download`, `base64ToBlob`
- Board exports: `saveBoardToFile`, `loadBoardFromFile`, `exportAsSvg`, `exportAsPng`, `exportAsJpg`
- Validation: `isValidThinkixData`, `sanitizeFileName`
- Types: `ThinkixExportedData`, `FileOpenOptions`, `FileSaveOptions`
- Import: `import { saveBoardToFile, exportAsPng } from '@thinkix/file-utils';`

### Shared Directory

**Why two locations for shared code?**

The monorepo uses a dual approach to avoid type duplication issues:

| Location | Contains | Reason |
|----------|----------|--------|
| `packages/shared/` | **Types only** (no JSX) | Workspace package, import as `@thinkix/shared` |
| `shared/constants/` | **JSX + constants** | App-level, import as `@/shared/constants` |

**Usage:**
```typescript
// Types (workspace package)
import type { DrawingTool, BoardState } from '@thinkix/shared';

// Constants with JSX (app-level)
import { BASIC_TOOLS, TOOLBAR_ITEM_CLASS } from '@/shared/constants';
```

## Architecture

### Feature-Based Structure

```text
features/
├── board/                        # Board canvas and state management
│   ├── components/
│   │   └── BoardCanvas.tsx      # Main canvas with Plait Wrapper + plugins
│   ├── hooks/
│   │   └── use-board-state.tsx  # Board context and tool state
│   ├── plugins/
│   │   ├── add-image-renderer.tsx
│   │   ├── add-emoji-renderer.tsx
│   │   ├── add-text-renderer.tsx
│   │   ├── add-mind-node-resize.ts
│   │   ├── add-pen-mode.ts
│   │   ├── add-image-interactions.ts
│   │   ├── with-sticky-note.ts
│   │   ├── with-eraser.ts
│   │   ├── with-text-normalization.ts
│   │   ├── handdrawn-mode/       # Hand-drawn style mode
│   │   └── scribble/             # Freehand drawing plugin
│   └── utils/
│       └── laser-pointer.ts
│
├── agent/                        # AI Agent pane and tool execution
│   ├── components/
│   │   ├── AgentPane.tsx        # Main agent pane UI (Cmd+J toggle)
│   │   ├── AgentToolRenderer.tsx # Custom tool display labels
│   │   └── AgentSettingsDialog.tsx # API key configuration
│   ├── hooks/
│   │   └── use-agent-chat.ts    # AI SDK v5 chat hook with tool execution
│   ├── tools/
│   │   ├── file-system-ops.ts   # Tool execution (ls, read, write, patch, rm, select)
│   │   ├── serializer.ts        # Plait elements -> DSL serialization
│   │   └── dsl/
│   │       ├── types.ts         # AST types (ShapeNode, StickyNode, etc.)
│   │       ├── thinkix.peggy    # Peggy grammar for DSL parsing
│   │       ├── parser.js        # Generated parser (run `bun run build:parser`)
│   │       ├── parser.ts        # Parser wrapper with error handling
│   │       └── compiler.ts      # AST -> PlaitElement compilation
│   └── index.ts                 # Barrel export
│
├── toolbar/                      # Toolbar UI
│   └── components/
│       ├── BoardToolbar.tsx      # Main toolbar
│       ├── AppMenu.tsx           # Application menu
│       ├── ZoomToolbar.tsx       # Zoom controls
│       ├── SelectionToolbar.tsx  # Selection-specific tools
│       └── inline/               # Inline formatting controls
│           ├── TextColorDropdown.tsx
│           ├── FontSizeControl.tsx
│           ├── ColorDropdown.tsx
│           └── ArrowDropdown.tsx
│
└── storage/                      # Storage management
    ├── hooks/
    │   └── use-auto-save.ts
    └── components/
        └── BoardSwitcher.tsx

shared/constants/
├── tools.tsx         # Tool configurations
├── icons.tsx         # Icon components
├── colors.ts         # Color definitions
├── styles.ts         # Style constants
└── inline-toolbar.ts # Inline toolbar config
```

### Plait Integration

The board uses `@plait-board/react-board@0.4.0-2` with Plait 0.92.1 packages.

**Custom Plugins** (loaded in BoardCanvas.tsx):
- `addImageRenderer` - React-based image rendering
- `addTextRenderer` - Custom Slate-based text editor
- `addEmojiRenderer` - Emoji rendering for mind maps
- `addMindNodeResize` - Resize handles for mind nodes
- `addPenMode` - Stylus/pencil detection
- `addImageInteractions` - Drag-drop, paste, click-to-view
- `withScribble` - Freehand drawing with smoothing
- `withStickyNote` - Sticky note support
- `withEraser` - Eraser tool
- `withTextNormalization` - Text value normalization
- `withHanddrawnMode` - Hand-drawn aesthetic mode

**Standard Plait Plugins:**
- `withText` - Text editing from `@plait/common`
- `withSelection` - Element selection
- `withDraw` - Drawing primitives
- `withGroup` - Grouping support
- `withMind` - Mind map creation
- `withHistory` - Undo/redo
- `withHotkey` - Keyboard shortcuts

### Custom Text Renderer

**IMPORTANT**: The project uses a custom Slate-based text renderer (`features/board/plugins/add-text-renderer.tsx`) instead of `@plait-board/react-text`.

**Why custom?**
- Fixes text typing persistence issue (React 19 + root.render() incompatibility)
- Removes default Chinese text ("文本") on new text elements
- Provides full control over editor lifecycle and state management

**Text element properties:**
- `autoSize: true` - Elements automatically resize to fit text content
- Text elements use Slate JSON format: `{ children: [{ text: 'content' }] }`

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

## Testing

Tests are located in `tests/` directory:

```text
tests/
├── unit/                    # Unit tests
│   └── file-utils.test.ts
├── integration/             # Integration tests
│   └── storage.test.ts
├── components/              # Component tests
│   └── loading-logo.test.tsx
├── __utils__/
│   └── test-utils.ts        # Testing utilities
└── __mocks__/
    └── setup.mts            # Global test setup
```

**Testing Stack:**
- Vitest with `happy-dom` environment
- `@testing-library/react` for component testing
- `@vitest/coverage-v8` for coverage reports

**Coverage Configuration:**
- Excludes: `node_modules`, `scratch`, `.next`, `tests`, `app`, config files

## CI/CD

GitHub Actions workflow with parallel jobs:

```text
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│    lint     │   │  typecheck  │   │    test     │
│  (parallel) │   │  (parallel) │   │  (parallel) │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                  All must pass ✓
                         │
                  ┌──────▼──────┐
                  │    build    │
                  └─────────────┘
```

**Workflow Files:**
- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/actions/setup-bun/` - Reusable Bun setup with caching
- `.github/actions/coverage-report/` - Coverage upload and PR comments
- `.github/scripts/coverage-summary.sh` - Coverage parsing script

## Important Configuration

- **next.config.ts**: Transpiles `@plait-board/*` packages (required for client-side rendering)
- **tsconfig.json**: Path aliases `@/features/*`, `@/shared/*`, `@/components/*`
- **vitest.config.mts**: Test configuration with path aliases matching tsconfig
- **Plait packages**: Do NOT use webpack resolve aliases - causes internal dependency conflicts

## AI Environment Variables

The agent supports both local per-user API keys and server-side defaults.

Preferred env vars:

```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4o
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1

OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1

ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

Resolution order:
- user-supplied agent settings from the UI
- provider-specific env vars such as `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
- generic env vars such as `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`
- built-in provider defaults from `packages/ai/src/core.ts`

The client should never receive raw keys. The UI reads a safe `/api/agent/config` response to learn whether server defaults exist and what provider/model should be shown by default.

## AI Agent Architecture

The AI Agent pane provides an LLM-powered assistant that can read, create, edit, and delete canvas elements via tool calling with a custom DSL.

### Tech Stack
- **AI SDK v5** (`ai` package) with `streamText` for server-side streaming
- **AI Elements** (shadcn-based AI components) for UI: Conversation, Message, Tool, PromptInput
- **Peggy parser generator** for DSL parsing
- **Zod** for tool schema validation

### How It Works
1. User sends a message via `AgentPane` (Cmd+J to toggle)
2. Request goes to `/api/agent` which streams LLM response with tool calls
3. Client-side `useAgentChat` hook intercepts tool calls and executes them via `file-system-ops.ts`
4. Tools operate on the Plait board: `ls`, `read`, `write`, `patch`, `rm`, `select`

### DSL (Domain-Specific Language)
Custom DSL bridges natural language to Plait elements:

```text
shape rect "My Box"                    # Create rectangle
sticky "Note" color:yellow             # Create sticky note
connect id:abc123 -> id:def456         # Connect elements
mindmap "Root"                         # Create mind map
  "Child 1"
patch abc123 text:"New label"          # Update element
layout grid                            # Arrange in grid
```

### Key Files
- `features/agent/tools/dsl/thinkix.peggy` - Peggy grammar
- `features/agent/tools/dsl/compiler.ts` - AST -> PlaitElement
- `features/agent/tools/serializer.ts` - PlaitElement -> DSL
- `features/agent/tools/file-system-ops.ts` - Tool execution
- `packages/ai/prompts/system.ts` - System prompt builder

### Parser Generation
The DSL parser must be regenerated after grammar changes:
```bash
bun run build:parser  # Generates features/agent/tools/dsl/parser.js
```

## Adding New Workspace Packages

When creating workspace packages, follow these guidelines:

### Types-Only Packages (preferred)
For packages containing only TypeScript types (no JSX):
```json
{
  "name": "@thinkix/types",
  "devDependencies": {
    "typescript": "^5"
  }
}
```
- Do NOT add `@types/react` as devDependency (causes duplicate type conflicts)
- Use `peerDependencies` if the package requires React at runtime

### Packages with JSX
For packages containing React components (JSX):
- Keep dependencies minimal
- Use `peerDependencies` for React instead of regular dependencies
- Avoid `@types/react` in devDependencies (comes from root)

## Known Issues & Solutions

### Tool Change Event System
- **Issue**: Plait doesn't provide hooks for tool changes triggered internally (e.g., after creating elements)
- **Solution**: `withToolSync` plugin monkey-patches `BoardTransforms.updatePointerType` to emit custom events
- **Event**: `CUSTOM_EVENTS.TOOL_CHANGE` dispatched when pointer transitions to selection mode
- **Usage**: Listen with `window.addEventListener(CUSTOM_EVENTS.TOOL_CHANGE, handler)`
- **Location**: `features/board/plugins/with-tool-sync.ts`
- **Why this approach**: 
  - Enables React state integration for tool tracking
  - Supports conditional rendering based on active tool
  - Triggers side effects (analytics, UI updates) on tool changes
  - Handles internal Plait pointer changes (e.g., after element creation)
- **Alternative**: Drawnix reads `board.pointer` directly (simpler but no React state)
- **Tradeoff**: More complex but provides better React integration
- **Note**: Monitor Plait updates for native event support
