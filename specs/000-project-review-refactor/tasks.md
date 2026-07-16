# Tasks: Phase 0 — Architecture Review & Refactor

**Input**: Design documents from `/specs/000-project-review-refactor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US3, US1, US2, US5, US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Verification)

**Purpose**: Confirm the project builds and lints before starting refactoring

- [ ] T001 Run `npx tsc --noEmit` to verify current TypeScript compilation status in project root
- [ ] T002 Run `npm run lint` to verify current ESLint status in project root

---

## Phase 2: Foundational — Shared Types & Category Fix (US3 + US4)

**Purpose**: Relocate all shared types to `src/shared/workflow/` and remove the hardcoded category constraint. These are prerequisites for all other user stories.

**⚠️ CRITICAL**: No compiler, transformer, or generator work can begin until this phase is complete.

### Implementation for US3 — Relocate Shared Types

- [ ] T003 [P] [US3] Create `src/shared/workflow/` directory with barrel `index.ts` exporting all types
- [ ] T004 [P] [US3] Create `src/shared/workflow/workflow-dsl.ts` with `WorkflowDSL` and `WorkflowDSLNode` interfaces (moved from `src/features/workflow-transformer/types/`)
- [ ] T005 [P] [US3] Create `src/shared/workflow/config-value.ts` with `ConfigValue`, `StaticValue`, `BindingValue` types (moved from `src/features/code-generator/types/ConfigValue.type.ts`)
- [ ] T006 [US3] Update all imports of `WorkflowDSL` across codebase to use `@/shared/workflow/` (files: `workflow-to-dsl.ts`, `appscript-generator.ts`)
- [ ] T007 [US3] Update all imports of `ConfigValue` across codebase to use `@/shared/workflow/` (files: `compile-node-config.ts`, `resolve-binding-value.ts`, `WorkflowDSLNode.interface.ts`)
- [ ] T008 [US3] Delete `src/features/workflow-transformer/types/WorkflowDSL.inteface.ts` and `WorkflowDSLNode.interface.ts`
- [ ] T009 [US3] Delete `src/features/code-generator/types/ConfigValue.type.ts`
- [ ] T010 [US3] Delete `src/shared/types/bindings.interface.ts` (duplicate of `ConfigValue` types)
- [ ] T011 [US3] Update any remaining imports that referenced the deleted type files to use `@/shared/workflow/`

### Implementation for US4 — Remove Hardcoded Category

- [ ] T012 [P] [US4] Change `NodeUIConfig.category` from `"GMAIL" | "FORMS"` to `string` in `src/shared/types/node.interface.ts`

**Checkpoint**: Foundation ready — compiler and transformer work can now begin. Run `npx tsc --noEmit` to verify no type errors.

---

## Phase 3: User Story 1 — Decouple Compiler from Module Registries (Priority: P1)

**Goal**: The compiler resolves node generators through a generic `resolveNode()` function, removing all direct references to specific module registries.

**Independent Test**: Confirm `src/features/code-generator/` contains zero imports from `src/features/modules/`.

### Implementation for US1

- [ ] T013 [P] [US1] Add `resolveNodeDefinition(type: string)` function to `src/shared/registry/node.registry.ts` that iterates all module registries and returns matching `WorkflowNodeDefinition`
- [ ] T014 [US1] Refactor `src/features/code-generator/appscript-generator.ts` to replace `nodeRegistry.formsRegistry[type]` and `nodeRegistry.gmailRegistry[type]` with calls to `resolveNodeDefinition(type)`
- [ ] T015 [US1] Remove the `nodeRegistry` import from `appscript-generator.ts` — the compiler must only import `resolveNodeDefinition` from `@/shared/registry/node.registry`
- [ ] T016 [US1] Add clear error handling in the compiler for missing node types: `if (!nodeDef) throw new Error(...)` with the node type in the message

**Checkpoint**: Compiler has zero module-specific imports. Run `grep -r "features/modules" src/features/code-generator/` — expect zero matches.

---

## Phase 4: User Story 2 — Introduce Compilation Target Abstraction (Priority: P1)

**Goal**: A `CompilationTarget` interface exists with an `AppsScriptTarget` implementation. The compiler uses only the interface.

**Independent Test**: Confirm `CompilationTarget` interface exists in `src/shared/workflow/`, `AppsScriptTarget` implements it, and the compiler uses only interface methods.

### Implementation for US2

- [ ] T017 [P] [US2] Create `src/shared/workflow/compilation-target.ts` with `CompilationTarget` interface and `CodeSnippet` type (per contract: `compilation-target.md`)
- [ ] T018 [P] [US2] Create `src/features/code-generator/targets/apps-script.ts` implementing `AppsScriptTarget` with Apps Script-specific methods
- [ ] T019 [US2] Refactor `src/features/code-generator/compiler/resolve-binding-value.ts` to accept a `CompilationTarget` parameter and use `target.resolveBinding(field)` instead of hardcoded `e.namedValues['field'][0]`
- [ ] T020 [US2] Rename or refactor `src/features/code-generator/appscript-generator.ts` into `src/features/code-generator/compiler/compile.ts` — the compiler orchestrator that accepts a `CompilationTarget` and uses it for all runtime-specific code generation
- [ ] T021 [US2] Update `src/features/workflow-builder/components/SideBar.tsx` to import the compiler from the new location and pass the `AppsScriptTarget` instance

**Checkpoint**: Compiler uses `CompilationTarget` interface exclusively. Run `grep -r "namedValues" src/features/code-generator/` — expect zero matches (binding resolution delegated to target).

---

## Phase 5: User Story 5 — Add Graph Validation to Transformer (Priority: P2)

**Goal**: The transformer validates graph structure before DSL generation, producing clear errors for malformed graphs.

**Independent Test**: Feed malformed graphs (no trigger, multiple triggers, cycle, disconnected nodes) and confirm correct error messages.

### Implementation for US5

- [ ] T022 [P] [US5] Create `src/shared/workflow/graph-validation.ts` with `GraphValidationResult`, `GraphError` types and `validateGraph(nodes, edges)` function
- [ ] T023 [US5] Implement trigger validation: exactly one trigger node required (error codes: `NO_TRIGGER`, `MULTIPLE_TRIGGERS`)
- [ ] T024 [US5] Implement cycle detection using DFS with visited set (error code: `CYCLE_DETECTED`)
- [ ] T025 [US5] Implement reachability check using BFS from trigger node (error code: `DISCONNECTED_NODES`)
- [ ] T026 [US5] Update `src/features/workflow-transformer/workflow-to-dsl.ts` to call `validateGraph()` before DSL generation and throw on validation failure
- [ ] T027 [US5] Update `src/shared/workflow/index.ts` barrel export to include `GraphValidationResult` and `validateGraph`

**Checkpoint**: Transformer throws clear errors for all malformed graph cases. Valid linear workflows still produce correct DSL.

---

## Phase 6: User Story 6 — Improve Generator Contract (Priority: P3)

**Goal**: Node generators return structured `CodeSnippet` objects instead of raw strings. The compiler assembles them using the target.

**Independent Test**: Confirm generators return `{ functionBody, setupCode? }` and the compiler produces identical output for the Form Submit → Send Email workflow.

**⚠️ DEPENDS ON**: US2 (CompilationTarget must exist for the compiler to use during assembly)

### Implementation for US6

- [ ] T028 [US6] Update `NodeGenerator<T>` return type from `string` to `CodeSnippet` in `src/shared/types/node.interface.ts`
- [ ] T029 [US6] Update `src/features/modules/gmail/nodes/send-mail/generator.ts` to return `{ functionBody: "GmailApp.sendEmail(...);" }` instead of raw string
- [ ] T030 [US6] Update `src/features/modules/forms/nodes/form-submit/generator.ts` to return `{ functionBody: "...", setupCode: "ScriptApp.newTrigger(...)..." }` instead of the full function skeleton
- [ ] T031 [US6] Update the compiler (`src/features/code-generator/compiler/compile.ts`) to collect `functionBody` and `setupCode` from each node's generator output and assemble via `CompilationTarget` methods
- [ ] T032 [US6] Update `src/features/code-generator/compiler/compile-node-config.ts` if needed to work with the new generator return type

**Checkpoint**: The "Form Submit → Send Email" workflow produces identical output as before refactoring. Run the browser regression test.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates

- [ ] T033 Run `npx tsc --noEmit` — confirm zero TypeScript errors
- [ ] T034 Run `npm run lint` — confirm zero ESLint errors
- [ ] T035 Verify SC-001: `grep -r "features/modules" src/features/code-generator/` returns zero matches
- [ ] T036 Verify SC-002: `ls src/shared/workflow/` shows all 5 expected files
- [ ] T037 Verify SC-003: Confirm `NodeUIConfig.category` is `string` and existing modules compile
- [ ] T038 Verify SC-004: Manually test graph validation (no trigger, multiple triggers, cycle, disconnected, valid)
- [ ] T039 Verify SC-005: Browser regression test — Form Submit → Send Email produces correct Apps Script output
- [ ] T040 Update `overview.md` to reflect the new architecture (shared types location, compiler target abstraction, generic node resolution)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (shared types must be in place)
- **US2 (Phase 4)**: Depends on Phase 2 (shared types must be in place)
- **US5 (Phase 5)**: Depends on Phase 2 (shared types must be in place)
- **US6 (Phase 6)**: Depends on Phase 2 + US2 (needs CompilationTarget interface)
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within Each Phase

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Non-[P] tasks must run sequentially within their story

### Parallel Opportunities

- **Phase 2**: T003, T004, T005 can run in parallel (creating new files)
- **Phase 3 + Phase 4 + Phase 5**: Can run in parallel after Phase 2 (different files, no cross-dependencies)
- **Within Phase 3**: T013 can run first, then T014, T015, T016 sequentially
- **Within Phase 4**: T017 and T018 can run in parallel, then T019, T020, T021 sequentially
- **Within Phase 5**: T022 first, then T023, T024, T025 in parallel, then T026, T027 sequentially

---

## Implementation Strategy

### MVP First (Phases 1-4)

1. Complete Phase 1: Verify build
2. Complete Phase 2: Shared types relocated, category fixed
3. Complete Phase 3 (US1): Compiler decoupled from modules
4. Complete Phase 4 (US2): CompilationTarget introduced
5. **STOP and VALIDATE**: Run `tsc --noEmit`, `npm run lint`, verify no module imports in compiler

### Incremental Delivery

1. Phases 1-2 → Foundation established
2. Phase 3 (US1) → Compiler independence achieved
3. Phase 4 (US2) → Multi-target capability established
4. Phase 5 (US5) → Graph validation operational
5. Phase 6 (US6) → Generator contract improved
6. Phase 7 → All checks pass, documentation updated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- No test tasks are generated because the spec does not request TDD and no testing framework is configured
- Validation is done via TypeScript compilation, ESLint, grep checks, and manual browser testing
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
