# Quickstart: Phase 0 — Architecture Review & Refactor

**Purpose**: Validate that all refactoring tasks are complete and the architecture is correct.
**Date**: 2026-07-16

## Prerequisites

- Node.js 18+ installed
- npm installed
- Project dependencies installed (`npm install`)

## Validation Scenarios

### 1. TypeScript Compilation (SC-006)

```bash
npx tsc --noEmit
```

**Expected**: Zero errors. All type relocations and interface changes compile cleanly.

---

### 2. ESLint Passes (SC-007)

```bash
npm run lint
```

**Expected**: Zero errors. No lint violations introduced by refactoring.

---

### 3. Compiler Has No Module Imports (SC-001)

Inspect the compiler source files:

```bash
grep -r "features/modules" src/features/code-generator/
grep -r "features/workflow-builder" src/features/code-generator/
```

**Expected**: Zero matches. The compiler must not reference any module or UI code.

---

### 4. Shared Types at Correct Path (SC-002)

Verify the shared workflow directory exists and contains the expected files:

```bash
ls src/shared/workflow/
```

**Expected**: `index.ts`, `workflow-dsl.ts`, `config-value.ts`, `compilation-target.ts`, `graph-validation.ts`

Verify no duplicate types remain:

```bash
ls src/shared/types/bindings.interface.ts 2>/dev/null && echo "FAIL: duplicate exists" || echo "PASS: duplicate removed"
ls src/features/workflow-transformer/types/ 2>/dev/null && echo "FAIL: old types remain" || echo "PASS: old types removed"
ls src/features/code-generator/types/ 2>/dev/null && echo "FAIL: old types remain" || echo "PASS: old types removed"
```

**Expected**: All three print "PASS" — old type locations are empty or removed.

---

### 5. Category Field Is Generic (SC-003)

```bash
grep -n "category:" src/shared/types/node.interface.ts
```

**Expected**: `category: string` — not `"GMAIL" | "FORMS"`.

Verify a hypothetical new module compiles:

```bash
# Create a test file that uses a new category
echo 'import { NodeUIConfig } from "@/shared/types/node.interface"; const cfg: NodeUIConfig<{id: string}> = { metadata: { label: "Test", category: "SHEETS" }, fields: [] };' > /tmp/test-category.ts
# This should compile without error (check via tsc with the project config)
```

---

### 6. Graph Validation Works (SC-004)

Manually test the validation function by creating a test script or checking the transformer behavior:

- **No trigger**: Add nodes with no trigger kind → transformer throws "trigger is required"
- **Multiple triggers**: Add two trigger nodes → transformer throws "only one trigger is allowed"
- **Cycle**: Create A→B→A edge cycle → transformer throws "cycle detected"
- **Disconnected**: Add an orphan node → transformer warns about unreachable nodes
- **Valid linear**: Form Submit → Send Email → DSL produced correctly

---

### 7. Regression: Form Submit → Send Email (SC-005)

Open the application in the browser:

```bash
npm run dev
```

1. Add a "Form Submit" trigger node
2. Add a "Send Email" step node
3. Connect Form Submit → Send Email
4. Configure both nodes
5. Click "Log Nodes Store" in the sidebar

**Expected**: The console shows valid Apps Script code with `function setup()` and `function onFormSubmit(e)` containing `GmailApp.sendEmail(...)`.

---

### 8. Adding a Module Requires No Shared Changes (SC-003)

Simulate adding a new module by verifying:

```bash
grep -r "SHEETS" src/shared/
```

**Expected**: Zero matches. No shared code references specific module categories.

---

## Checklist

| # | Scenario | Command | Expected |
|---|----------|---------|----------|
| 1 | TypeScript compiles | `npx tsc --noEmit` | Zero errors |
| 2 | ESLint passes | `npm run lint` | Zero errors |
| 3 | No module imports in compiler | `grep -r "features/modules" src/features/code-generator/` | Zero matches |
| 4 | Shared types at correct path | `ls src/shared/workflow/` | 5 files present |
| 5 | Category is generic string | `grep "category:" src/shared/types/node.interface.ts` | `category: string` |
| 6 | Graph validation | Manual test | Correct errors for each case |
| 7 | Regression test | Browser test | Valid Apps Script output |
| 8 | No module refs in shared | `grep -r "SHEETS" src/shared/` | Zero matches |
