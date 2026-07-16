<!--
  Sync Impact Report
  Version change: N/A → 1.0.0
  Modified principles: N/A (initial ratification)
  Added sections:
    - Core Principles (6 principles)
    - Technology Standards
    - Development Workflow & Quality Gates
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check section already present)
    - .specify/templates/spec-template.md ✅ compatible
    - .specify/templates/tasks-template.md ✅ compatible
  Follow-up TODOs: none
-->

# Visual Google Apps Script Automation Builder Constitution

## Core Principles

### I. Compiler Independence (NON-NEGOTIABLE)

The compiler MUST operate exclusively on the Workflow DSL and a Compilation Target interface. It MUST NOT import or reference any module-specific code (Gmail, Forms, Sheets), UI framework code (React, ReactFlow), or runtime-specific APIs (Apps Script, Node.js).

All code generation is delegated to node generators resolved through the registry. The compiler orchestrates traversal and assembly but never generates domain-specific code directly.

**Rationale**: This principle enables multi-target compilation. A single Workflow DSL can produce Google Apps Script, Node.js, Cloud Functions, or any future target without modifying the compiler core.

---

### II. Node Extensibility

Adding a new node MUST require only implementing the Node Contract (schema, UI config, generator) and registering it in a module registry. No existing compiler, transformer, or shared code MAY need modification to support a new node type.

Each node is a self-contained unit with four files:

```
schema.ts      — Zod validation schema
ui_config.ts   — field descriptors for the config form
generator.ts   — returns a structured code snippet for the compilation target
index.ts       — exports the WorkflowNodeDefinition
```

**Rationale**: Enables community contributions and rapid expansion of the node library without touching core infrastructure.

---

### III. Module Isolation

Every Google Workspace service (Gmail, Forms, Sheets, Calendar, etc.) MUST be implemented as an independent module under `src/features/modules/`. Modules MUST NOT import from each other. Shared code MUST live in `src/shared/`.

Each module owns:

- Its nodes and their implementations
- Its module registry (with metadata, icon, category)
- Its domain-specific types

Modules MUST NOT depend on the compiler, transformer, or UI layer.

**Rationale**: Prevents cross-module coupling and allows modules to be added, removed, or replaced independently.

---

### IV. Layered Architecture & Separation of Concerns

The system MUST maintain strict layer boundaries:

```
UI Layer (ReactFlow components, store)
    ↓
Workflow Graph (nodes + edges in Zustand store)
    ↓
Workflow Transformer (graph → DSL)
    ↓
Workflow DSL (canonical intermediate representation)
    ↓
Compiler (DSL → source tree via target abstraction)
    ↓
Compilation Target (Apps Script, Node.js, etc.)
    ↓
Generated Source Code
```

Each layer MUST only depend on the layer directly below it. Upward dependencies (e.g., compiler importing UI code) are prohibited. The DSL types MUST live in `src/shared/workflow/` — not in any feature-specific directory.

**Rationale**: Enables independent testing, replacement, and evolution of each layer.

---

### V. Composition over Hardcoding

Dynamic resolution via registries and factories MUST be preferred over switch statements, if/else chains, or hardcoded type mappings. Node generators MUST be resolved at runtime through the registry, not through conditional logic in the compiler.

**Rationale**: Supports the plugin-like architecture required for extensibility without compiler modifications.

---

### VI. Type Safety & Contract-First Design

All inter-layer contracts MUST be defined as explicit TypeScript interfaces in `src/shared/`. Discriminated unions (tagged with `kind`) MUST be used for polymorphic data (e.g., `StaticValue | BindingValue`).

Zod schemas MUST be the single source of truth for node configuration validation. Validation MUST happen at the node level, never inside the compiler.

**Rationale**: Prevents runtime errors from malformed data flowing through the pipeline and ensures contracts are enforceable at compile time.

---

## Technology Standards

**Language**: TypeScript (strict mode)

**UI Framework**: React 19+ with Vite

**Visual Editor**: @xyflow/react (ReactFlow)

**State Management**: Zustand

**Styling**: Tailwind CSS v4

**Validation**: Zod v4

**Build Tool**: Vite 8+

**Package Manager**: npm

**Module Resolution**: Path aliases via `@/` mapped to `src/`

All new code MUST use TypeScript with explicit types. `any` MUST be avoided in production code — use `unknown` with type guards when the type is genuinely dynamic.

---

## Development Workflow & Quality Gates

### Before Implementation

1. The codebase MUST be reviewed against this constitution before beginning any new feature.
2. Phase 0 (Architecture Review & Refactor) MUST be completed before any feature work begins.
3. All architectural violations identified in review MUST be resolved before proceeding.

### Code Review Requirements

- Every PR MUST verify compliance with the six core principles.
- Compiler independence MUST be verified: no module-specific imports in compiler code.
- Node implementations MUST follow the four-file contract (schema, ui_config, generator, index).
- New modules MUST be isolated: no cross-module imports.

### Testing Strategy

- Node generators MUST be unit-testable in isolation (input config → output string).
- The transformer (graph → DSL) MUST be testable without UI dependencies.
- The compiler MUST be testable with mock DSL inputs.
- Validation schemas MUST be tested with both valid and invalid inputs.

### Documentation

- `PLAN.md` serves as the authoritative implementation roadmap.
- `overview.md` captures architectural decisions and rationale.
- Each module SHOULD include a brief README describing its nodes and capabilities.

---

## Governance

This constitution is the authoritative reference for architectural decisions in the Visual Google Apps Script Automation Builder project. It supersedes ad-hoc conventions and informal agreements.

**Amendment process**:

1. Proposed changes MUST be documented with rationale.
2. Version MUST be incremented per semantic versioning:
   - MAJOR: Principle removal or redefinition
   - MINOR: New principle or section added
   - PATCH: Clarification, wording fix, non-semantic change
3. All dependent templates and documentation MUST be reviewed for consistency after amendments.

**Compliance review**: Before merging any feature branch, the implementation MUST be checked against the principles in this constitution. Violations MUST be justified in the plan's Complexity Tracking table or resolved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-16
