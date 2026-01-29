# NX Monorepo Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Thinkix from a single Next.js app to an NX monorepo with shared packages for AI, UI, and Plait utilities

**Architecture:**
- Keep `app/` as the main Next.js application
- Create `packages/ai/` for AI SDK integration (chat, commands, providers)
- Create `packages/ui/` for shadcn components and shared UI elements
- Create `packages/plait-utils/` for Plait board helpers and types
- Use local workspace imports (`@thinkix/ai`, `@thinkix/ui`, etc.)

**Tech Stack:** NX 22, Next.js 16, React 19, Plait Board, Vercel AI SDK, shadcn/ui

---

### Task 1: Create packages/ui library with package.json

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`

**Step 1: Create packages/ui/package.json**

```json
{
  "name": "@thinkix/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx"
  },
  "scripts": {
    "lint": "eslint \"src/**/*.ts*\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "eslint": "^9"
  }
}
```

**Step 2: Create packages/ui/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": []
}
```

**Step 3: Run `yarn install` to update workspace**

**Step 4: Commit**

```bash
git add packages/ui/
git commit -m "feat: add @thinkix/ui package structure"
```

---

### Task 2: Create packages/ai library with package.json

**Files:**
- Create: `packages/ai/package.json`
- Create: `packages/ai/tsconfig.json`

**Step 1: Create packages/ai/package.json**

```json
{
  "name": "@thinkix/ai",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./lib/index.ts",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": "./lib/index.ts",
    "./commands": "./lib/commands.ts",
    "./providers": "./lib/providers.ts",
    "./types": "./lib/types.ts"
  },
  "scripts": {
    "lint": "eslint "lib/**/*.ts*"",
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "dependencies": {
    "ai": "^1.3.1",
    "@ai-sdk/openai": "^1.1.11",
    "@ai-sdk/anthropic": "^1.1.11",
    "@ai-sdk/react": "^1.1.11"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**Step 2: Create packages/ai/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./lib",
    "rootDir": "lib"
  },
  "include": ["lib/**/*"],
  "references": []
  }
}
```

**Step 3: Run `yarn install`**

**Step 4: Commit**

```bash
git add packages/ai/
git commit -m "feat: add @thinkix/ai package structure"
```

---

### Task 3: Create packages/plait-utils library with package.json

**Files:**
- Create: `packages/plait-utils/package.json`
- Create: `packages/plait-utils/tsconfig.json`

**Step 1: Create packages/plait-utils/package.json**

```json
{
  "name": "@thinkix/plait-utils",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./lib/index.ts",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": "./lib/index.ts",
    "./commands": "./lib/commands.ts",
    "./types": "./lib/types.ts"
  },
  "scripts": {
    "lint": "eslint "lib/**/*.ts*"",
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "dependencies": {
    "@plait/core": "^0.92.1",
    "@plait/mind": "^0.92.1",
    "@plait/common": "^0.92.1"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**Step 2: Create packages/plait-utils/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./lib",
    "rootDir": "lib"
  },
  "include": ["lib/**/*"],
  "references": []
  }
}
```

**Step 3: Run `yarn install`**

**Step 4: Commit**

```bash
git add packages/plait-utils/
git commit -m "feat: add @thinkix/plait-utils package structure"
```

---

### Task 4: Initialize shadcn/ui in packages/ui

**Files:**
- Create: `packages/ui/components.json`
- Run: `npx shadcn@latest init -y -d packages/ui`

**Step 1: Run shadcn init in packages/ui**

Run in project root:
```bash
cd packages/ui && npx shadcn@latest init -y
```

This will create `packages/ui/components.json` and necessary config.

**Step 2: Install core shadcn components**

Run from `packages/ui/`:
```bash
npx shadcn@latest add button input textarea scroll-area separator dropdown-menu
npx shadcn@latest add popover select slider avatar badge card dialog tooltip
```

**Step 3: Commit**

```bash
git add packages/ui/
git commit -m "feat: initialize shadcn/ui in @thinkix/ui"
```

---

### Task 5: Migrate shared components to packages/ui/src

**Files:**
- Modify: `components/ui/` (delete after migration)
- Create: `packages/ui/src/components.tsx`
- Create: `packages/ui/src/index.ts`

**Step 1: Check existing shared components**

Run:
```bash
ls components/ui/
```

**Step 2: Copy components to packages/ui/src/components**

Copy all UI components from `components/ui/` to `packages/ui/src/components/`

**Step 3: Create packages/ui/src/index.ts**

```typescript
export * from './components';
```

**Step 4: Update imports in app to use @thinkix/ui**

Run in `app/`:
```bash
find . -name "*.tsx" -o -name "*.ts" -type f | xargs sed -i '' 's|from ../../components/ui|from @thinkix/ui|g'
```

**Step 5: Delete old components/ui directory**

```bash
rm -rf components/ui
```

**Step 6: Verify build**

Run:
```bash
yarn build
```

Expected: Build passes

**Step 7: Commit**

```bash
git add .
git commit -m "refactor: migrate UI components to @thinkix/ui package"
```

---

### Task 6: Create packages/ai/lib/core.ts with AI SDK setup

**Files:**
- Create: `packages/ai/lib/core.ts`
- Create: `packages/ai/lib/index.ts`

**Step 1: Create packages/ai/lib/core.ts**

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export type AIProvider = 'openai' | 'anthropic';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  model: string;
}

export const MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', model: 'chatgpt-4o-01' },
    { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini', model: 'gpt-4o-mini' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet', provider: 'anthropic', name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022' },
    { id: 'claude-3-5-haiku', provider: 'anthropic', name: 'Claude 3.5 Haiku', model: 'claude-3-5-haiku-20250107' },
  ],
};

export interface UserSettings {
  providers: {
    openai: { apiKey: string | null };
    anthropic: { apiKey: string | null };
  };
}

export function createAIProvider(provider: AIProvider, apiKey: string) {
  if (provider === 'openai') {
    return createOpenAI({ apiKey });
  }
  if (provider === 'anthropic') {
    return createAnthropic({ apiKey });
  }
  throw new Error(`Unknown provider: ${provider}`);
}
```

**Step 2: Create packages/ai/lib/index.ts**

```typescript
export * from './core';
```

**Step 3: Commit**

```bash
git add packages/ai/
git commit -m "feat: add AI SDK setup in @thinkix/ai"
```

---

### Task 7: Create packages/ai/lib/commands.ts for canvas operations

**Files:**
- Create: `packages/ai/lib/commands.ts`

**Step 1: Create packages/ai/lib/commands.ts**

```typescript
import type { PlaitBoard } from '@plait/core';
import { MindTransforms, PlaitBoard as MindPlaitBoard } from '@plait/mind';
import { Transforms } from '@plait/core';

export interface CanvasCommand {
  type: 'createMindmap' | 'addNode' | 'addEdge' | 'updateNode' | 'deleteSelection';
  data: any;
}

export interface MindmapNodeData {
  text: string;
  position: [number, number];
  parentId?: string;
}

export interface UpdateNodeData {
  width?: number;
  height?: number;
  text?: string;
}

export function executeCommand(board: PlaitBoard, command: CanvasCommand): void {
  switch (command.type) {
    case 'createMindmap':
      MindTransforms.insertNode(board as MindPlaitBoard, command.data);
      break;
    case 'addNode':
      Transforms.setNode(board, command.data);
      break;
    case 'updateNode':
      Transforms.setNode(board, command.data, PlaitBoard.findPath(board, command.data.element));
      break;
    case 'deleteSelection':
      // Handle deletion
      break;
  }
}
```

**Step 2: Export from packages/ai/lib/index.ts**

Update `packages/ai/lib/index.ts`:
```typescript
export * from './core';
export * from './commands';
```

**Step 3: Commit**

```bash
git add packages/ai/lib/commands.ts
git commit -m "feat: add canvas command execution in @thinkix/ai"
```

---

### Task 8: Migrate AI chat components to packages/ai

**Files:**
- Move: `features/ai/components/*` → `packages/ai/src/components/`
- Create: `packages/ai/src/index.ts`

**Step 1: Create packages/ai/src directory**

```bash
mkdir -p packages/ai/src/components
```

**Step 2: Move AI components**

Check if any AI components exist:
```bash
ls features/ai/components/ || echo "No AI components yet"
```

If components exist, move them:
```bash
mv features/ai/components/* packages/ai/src/components/
```

**Step 3: Create packages/ai/src/index.ts`

```typescript
export * from './components';
export * from '../lib';
```

**Step 4: Update imports if needed**

**Step 5: Commit**

```bash
git add packages/ai/
git commit -m "feat: migrate AI components to @thinkix/ai"
```

---

### Task 9: Create packages/plait-utils/lib/index.ts with Plait helpers

**Files:**
- Create: `packages/plait-utils/lib/index.ts`

**Step 1: Create packages/plait-utils/lib/index.ts**

```typescript
import type { PlaitBoard, PlaitElement } from '@plait/core';
import { MindElement } from '@plait/mind';

export function getSelectedMindElements(board: PlaitBoard): MindElement[] {
  const selected = board.selection ? board.selection : [];
  return selected.filter((e) => MindElement.isMindElement(board, e)) as MindElement[];
}

export function getCanvasContext(board: PlaitBoard): string {
  const elements = PlaitBoard.getValue(board);
  const selected = board.selection || [];

  return JSON.stringify({
    elements,
    selected: selected.map((e: PlaitElement) => e.id),
    viewport: board.viewport,
  }, null, 2);
}

export function findElementById(board: PlaitBoard, id: string): PlaitElement | null {
  const elements = PlaitBoard.getValue(board) as PlaitElement[];
  return elements.find((e) => e.id === id) || null;
}
```

**Step 2: Commit**

```bash
git add packages/plait-utils/
git commit -m "feat: add Plait helper functions to @thinkix/plait-utils"
```

---

### Task 10: Update all imports across codebase to use workspace packages

**Files:**
- Modify: Multiple files to update import paths

**Step 1: Update imports in app/ directory**

Find and replace imports:
```bash
# Replace Plait imports
find app -name "*.tsx" -o -name "*.ts" -type f | xargs sed -i '' 's|from ['\"]@plait/core['\"]|from '@thinkix/plait-utils'|g'

# Replace component imports
find app -name "*.tsx" -type f | xargs sed -i '' 's|from ['"]\.\.\/\.\.\/components\/ui|from @thinkix/ui|g'
```

**Step 2: Verify build**

Run:
```bash
yarn build
```

Expected: Build passes with no import errors

**Step 3: Fix any remaining import issues**

Check `features/` directories for hardcoded imports and update

**Step 4: Commit**

```bash
git add .
git commit -m "refactor: update imports to use workspace packages"
```

---

### Task 11: Create API routes in app/api for AI chat

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `app/api/structure/route.ts`

**Step 1: Create app/api/chat/route.ts**

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, provider = 'openai', model = 'gpt-4o' } = await req.json();

  const ai = provider === 'openai' ? openai() : anthropic();

  const result = streamText({
    model,
    messages,
    temperature: 0.7,
  }, ai);

  return result.toDataStreamResponse();
}
```

**Step 2: Create app/api/structure/route.ts**

```typescript
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { content, provider = 'openai', model = 'gpt-4o' } = await req.json();

  const ai = provider === 'openai' ? openai() : anthropic();

  const prompt = `Structure the following content into a mindmap format. Return ONLY valid JSON:\n\n${content}`;

  const result = streamText({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  }, ai);

  return result.toDataStreamResponse();
}
```

**Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add AI chat and structure API routes"
```

---

### Task 12: Update tsconfig.json for workspace references

**Files:**
- Modify: `tsconfig.json`

**Step 1: Update tsconfig.json with references**

```json
{
  "extends": "@nx/typescript",
  "compilerOptions": {
    // ... existing options
  },
  "references": [
    { "path": "./packages/ui" },
    { "path": "./packages/ai" },
    { "path": "./packages/plait-utils" }
  ]
}
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
yarn build
```

Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add workspace package references to tsconfig"
```

---

### Task 13: Clean up unused files and old structure

**Files:**
- Delete: `components/` (if empty after migration)
- Check: `features/` directories for remaining migrations

**Step 1: Remove old components directory if empty**

```bash
ls components/ || echo "No components dir"
```

If empty:
```bash
rm -rf components/
git add components/
git commit -m "chore: remove old components directory"
```

**Step 2: Verify features/ structure still works**

```bash
yarn build
```

**Step 3: Run typecheck**

```bash
yarn typecheck
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: cleanup and verify migration complete"
```

---

### Task 14: Update CLAUDE.md with new monorepo structure

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update CLAUDE.md with new structure**

Update the sections for:
- Project structure (apps/, packages/)
- Available packages (@thinkix/ui, @thinkix/ai, @thinkix/plait-utils)
- How to add new packages

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with NX monorepo structure"
```

---

### Task 15: Verify all package exports work correctly

**Files:**
- Test: Create test file in app/ to import from each package

**Step 1: Create test file `app/test-imports.tsx`**

```tsx
import { Button } from '@thinkix/ui';
import { executeCommand, MODELS } from '@thinkix/ai';
import { getSelectedMindElements } from '@thinkix/plait-utils';

export function TestImports() {
  return (
    <div>
      <Button>Test Button</Button>
      <pre>{JSON.stringify(MODELS, null, 2)}</pre>
    </div>
  );
}
```

**Step 2: Temporarily add to app/page.tsx**

```tsx
import { TestImports } from './test-imports';

// In JSX, add: <TestImports />
```

**Step 3: Run build**

```bash
yarn build
```

Expected: Build succeeds

**Step 4: Remove test file and cleanup**

```bash
rm app/test-imports.tsx
git add .
git commit -m "test: verify package imports, cleanup"
```

---

**Execution complete!**

Run `yarn build` and `yarn dev` to verify everything works.

**Summary:**
- Created 3 packages: @thinkix/ui, @thinkix/ai, @thinkix/plait-utils
- Migrated UI components to shared package
- Set up AI SDK integration layer
- Created API routes for AI chat and structure
- Updated all imports to use workspace packages
- Configured TypeScript for workspace
