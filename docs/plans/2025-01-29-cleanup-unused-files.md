# Cleanup Unused Files After Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove unused files and dependencies after NX monorepo migration

**Architecture:** Delete package-lock.json (npm leftover) and verify no unused dependencies remain

**Tech Stack:** Yarn workspaces, Next.js 16

---

### Task 1: Remove package-lock.json

**Files:**
- Delete: `package-lock.json`

**Step 1: Verify yarn.lock exists**

Run:
```bash
ls -la yarn.lock
```

Expected: File exists

**Step 2: Remove package-lock.json**

Run:
```bash
rm package-lock.json
```

**Step 3: Verify build still works**

Run:
```bash
yarn build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add package-lock.json
git commit -m "chore: remove npm package-lock.json (using yarn)"
```

---

### Task 2: Verify @plait/text is actually used

**Files:**
- Check: `package.json` dependency

**Step 1: Check if @plait/text is imported**

Run:
```bash
grep -r "from '@plait/text'" --include="*.ts" --include="*.tsx" .
grep -r "from '@plait/text/" --include="*.ts" --include="*.tsx" .
```

Expected: May show usage in node_modules or yarn.lock only

**Step 2: Check if @plait-board/react-text uses it**

Run:
```bash
cat node_modules/@plait-board/react-text/package.json | grep '@plait/text'
```

Expected: Shows @plait/text-plugins dependency

**Result:** @plait/text is a peer dependency of @plait-board/react-text, keep it.

---

### Task 3: Verify no duplicate @radix dependencies

**Files:**
- Check: Root `package.json` vs `packages/ui/package.json`

**Step 1: Check which @radix packages are in root**

Run:
```bash
grep "@radix-ui" package.json
```

**Step 2: Check which @radix packages are in packages/ui**

Run:
```bash
grep "@radix-ui" packages/ui/package.json
```

**Step 3: Compare and remove duplicates from root**

If @radix packages exist in both root and packages/ui:
- Keep in packages/ui (where they're used)
- Remove from root if only used by packages/ui

**Step 4: Run yarn install**

Run:
```bash
yarn install
```

**Step 5: Verify build**

Run:
```bash
yarn build
```

**Step 6: Commit if changes made**

```bash
git add package.json yarn.lock
git commit -m "chore: remove duplicate @radix dependencies from root"
```

---

### Task 4: Check for unused shared/types files

**Files:**
- Check: `shared/types/`

**Step 1: List shared type files**

Run:
```bash
ls -la shared/types/
```

**Step 2: For each file, check if it's imported**

Run:
```bash
grep -r "from '@/shared/types" --include="*.ts" --include="*.tsx" .
grep -r "@/shared/types/" --include="*.ts" --include="*.tsx" .
```

**Step 3: Remove any unused type files**

If any files are not imported, remove them:
```bash
rm shared/types/unused-file.ts
```

**Step 4: Commit**

```bash
git add shared/types/
git commit -m "chore: remove unused type files"
```

---

**Execution complete!**

Run `yarn build` and `yarn dev` to verify everything works.
