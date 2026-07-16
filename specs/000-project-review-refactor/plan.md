# Implementation Plan: Phase 0 — Architecture Review & Refactor

**Branch**: `000-project-review-refactor` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/000-project-review-refactor/spec.md`

## Summary

Refactor the existing Visual Google Apps Script Automation Builder codebase to resolve 7 architectural violations identified during Phase 0 review. The refactoring targets the architecture layers (types, compiler, transformer, registry) while preserving all existing UI and module functionality. The primary goal is to establish correct layer boundaries, introduce a compilation target abstraction, and ensure the compiler operates independently of any specific module or runtime.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode)

**Primary Dependencies**: React 19, @xyflow/react 12, Zustand 5, Zod 4, Tailwind CSS 4

**Storage**: N/A (in-memory state only; no persistence layer)

**Testing**: No testing framework configured yet. Validation is manual via TypeScript compilation (`tsc --noEmit`) and ESLint (`eslint .`).

**Target Platform**: Web application (browser); compilation target is Google Apps Script

**Project Type**: Compiler / Visual workflow builder (Vite + React frontend with a compiler pipeline)

**Performance Goals**: N/A for this phase — architecture refactoring, no user-facing performance changes

**Constraints**: Must not break existing "Form Submit → Send Email" end-to-end workflow. Must maintain `@/` path alias. No CI/CD — manual validation.

**Scale/Scope**: ~39 source files. 2 existing modules (Gmail, Forms). ~500 lines of compiler/transformer code to refactor.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Compiler Independence | **VIOLATION** | `appscript-generator.ts` imports from `nodeRegistry` which couples to specific modules. Must introduce generic resolution. |
| II. Node Extensibility | **VIOLATION** | `NodeUIConfig.category` is hardcoded `"GMAIL" \| "FORMS"`. Must change to `string`. |
| III. Module Isolation | **PASS** | Modules do not import from each other. |
| IV. Layered Architecture | **VIOLATION** | DSL types live in feature directories. `WorkflowDSLNode` imports from `code-generator/types/`. Must move to `src/shared/workflow/`. |
| V. Composition over Hardcoding | **VIOLATION** | Compiler resolves generators via hardcoded `nodeRegistry.formsRegistry[type]` and `nodeRegistry.gmailRegistry[type]`. Must use generic lookup. |
| VI. Type Safety | **PARTIAL** | Zod schemas are used for validation. Discriminated unions exist for ConfigValue. But duplicate types in `bindings.interface.ts` violate single-source contract. |

**Gate Decision**: PASS with conditions — all violations are addressed by the spec's user stories. No unjustified violations.

## Project Structure

### Documentation (this feature)

```text
specs/000-project-review-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── compilation-target.md
│   └── node-registry.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── workflow/                    # NEW — canonical types
│   │   ├── index.ts                 # barrel export
│   │   ├── workflow-dsl.ts          # WorkflowDSL, WorkflowDSLNode
│   │   ├── config-value.ts          # ConfigValue, StaticValue, BindingValue
│   │   ├── compilation-target.ts    # CompilationTarget interface
│   │   └── graph-validation.ts      # GraphValidationResult
│   ├── registry/
│   │   └── node.registry.ts         # MODIFIED — add resolveNode() generic lookup
│   ├── types/
│   │   ├── node.interface.ts        # MODIFIED — category: string
│   │   ├── category.interface.ts    # UNCHANGED
│   │   └── position.type.ts         # UNCHANGED
│   │                               # DELETED: bindings.interface.ts
│   └── utils/
│       ├── resolve-available-bindings.ts  # UNCHANGED
│       └── validator.ts                   # UNCHANGED
├── features/
│   ├── code-generator/
│   │   ├── compiler/
│   │   │   ├── compile.ts           # NEW — compiler orchestrator
│   │   │   ├── compile-node-config.ts  # UNCHANGED
│   │   │   └── resolve-binding-value.ts  # MODIFIED — accept target
│   │   └── targets/
│   │       └── apps-script.ts       # NEW — AppsScriptTarget
│   │                               # DELETED: appscript-generator.ts
│   │                               # DELETED: types/ConfigValue.type.ts (moved to shared)
│   ├── workflow-transformer/
│   │   ├── workflow-to-dsl.ts       # MODIFIED — add validation
│   │   ├── types/                   # DELETED (moved to shared/workflow/)
│   │   └── ...                      # UNCHANGED
│   ├── modules/
│   │   ├── gmail/                   # MODIFIED — generator returns structured snippet
│   │   ├── forms/                   # MODIFIED — generator returns structured snippet
│   │   └── ...                      # UNCHANGED
│   └── workflow-builder/            # UNCHANGED
```

**Structure Decision**: Single-project architecture with feature-based organization. New `src/shared/workflow/` directory houses all cross-layer type definitions. Compiler refactored from a single function to a proper orchestrator with target abstraction.

## Complexity Tracking

No constitution violations that require justification. All violations are architectural debt being resolved by this phase.
