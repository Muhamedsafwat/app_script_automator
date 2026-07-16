# Spec Kit Implementation Roadmap

> **Project:** Visual Google Apps Script Automation Builder
>
> This document defines the implementation roadmap for the project. It is intended to be consumed by Spec Kit to generate implementation specifications iteratively.
>
> The project follows an **Architecture First** approach. Features are implemented only after the underlying architecture is established.
>
> **Constitution**: All implementation decisions MUST comply with the principles defined in `.specify/memory/constitution.md`.

---

# Project Vision

Build a visual automation platform for Google Workspace that allows users to create workflows using a drag-and-drop interface, then compile those workflows into deployable Google Apps Script projects.

The platform is **not** intended to compete with n8n as a generic automation engine.

Instead, it focuses on:

- Google Workspace
- Zero infrastructure
- Generated Apps Script
- Visual workflow building
- Extensible architecture

---

# Development Strategy

The project follows **Incremental Vertical Slice Development**.

Instead of implementing all infrastructure first or all features first, every milestone should deliver a complete architectural capability that can be expanded later.

The priority order is:

1. Architecture
2. Compiler
3. Node SDK
4. Modules
5. UI
6. Deployment
7. Advanced Features

---

# Before Starting

Before implementing any new functionality, analyze the existing codebase and perform a complete architectural review.

## Objectives

- Understand the current implementation.
- Compare it against the target architecture.
- Identify architectural violations.
- Remove unnecessary abstractions.
- Eliminate tight coupling.
- Refactor the project into the target structure.

No implementation should begin until the architecture matches the desired design.

---

# Target Architecture

```
UI Layer
        ↓
Workflow Graph
        ↓
Workflow Transformer
        ↓
Workflow DSL
        ↓
Compiler
        ↓
Compilation Target
        ↓
Generated Source Code
        ↓
Runtime
```

The compiler must never know anything about Google Apps Script directly.

Instead, it compiles a Workflow DSL into a target.

Current target:

- Google Apps Script

Future targets may include:

- Node.js
- Cloud Functions
- Edge Functions
- Cloudflare Workers

---

# Target Project Structure

```
src/

    features/

        modules/
            gmail/
            forms/
            sheets/
            calendar/

        workflow-builder/
        workflow-engine/
        compiler/
        deployment/

    shared/

        workflow/
        types/
        utils/
```

---

# Architectural Principles

## Separation of Concerns

Every layer has a single responsibility.

UI != Workflow DSL != Compiler != Runtime

---

## Extensibility

Adding a new node must never require modifying the compiler.

---

## Composition over Hardcoding

Avoid switch statements and large if/else chains whenever possible.

Use registries or factories for dynamic resolution.

---

## Module Isolation

Every Google service is represented as an independent module.

Examples:

- Gmail
- Forms
- Sheets
- Calendar

---

## Node Isolation

Every node owns its own implementation.

Each node contains:

```
schema.ts
validator.ts
generator.ts
ui.ts
```

---

## Compiler Independence

The compiler operates only on Workflow DSL.

It must not know anything about:

- Gmail
- Forms
- Apps Script
- React Flow

The compiler only knows:

- Workflow DSL
- Compiler Target

---

# Phases

---

# Phase 0

## Architecture Review & Refactor

### Goal

Prepare the existing codebase for long-term scalability by resolving architectural violations and aligning the implementation with the target architecture defined in this document.

### Current State Analysis

The project has a working prototype with:

- ReactFlow-based workflow builder UI (Phase 4)
- Workflow transformer (graph → DSL) with linear traversal
- Code generator (DSL → Apps Script) — tightly coupled
- Two modules: Gmail (send-email), Forms (form-submit)
- Node definition system (schema, UI, generator)
- Config form with static/binding toggle and Zod validation

### Identified Architectural Violations

#### 1. Compiler Coupling to Specific Registries

**File**: `src/features/code-generator/appscript-generator.ts`

The compiler directly references `nodeRegistry.formsRegistry` and `nodeRegistry.gmailRegistry`. It should resolve nodes generically through a unified lookup.

**Violation**: Compiler Independence, Composition over Hardcoding

**Required fix**: Introduce a `resolveNodeGenerator(type: string)` function that searches all registries dynamically. The compiler MUST NOT know which modules exist.

#### 2. No Compilation Target Abstraction

**File**: `src/features/code-generator/appscript-generator.ts`

The compiler produces raw Apps Script strings directly. There is no `CompilationTarget` interface to support future targets (Node.js, Cloud Functions, etc.).

**Violation**: Compiler Independence, Target Architecture alignment

**Required fix**: Introduce a `CompilationTarget` interface with methods like `wrapFunction()`, `wrapTrigger()`, `getRuntimeBinding()`. The Apps Script target implements this interface.

#### 3. Workflow DSL Types in Wrong Location

**Files**: `src/features/workflow-transformer/types/WorkflowDSL.inteface.ts`, `src/features/code-generator/types/ConfigValue.type.ts`

The DSL types are split across feature directories and have backward dependencies (DSL imports from code-generator). Shared types MUST live in `src/shared/workflow/`.

**Violation**: Layered Architecture, Separation of Concerns

**Required fix**:
- Move `WorkflowDSL`, `WorkflowDSLNode` → `src/shared/workflow/`
- Move `ConfigValue`, `StaticValue`, `BindingValue` → `src/shared/workflow/`
- Remove duplicate types in `src/shared/types/bindings.interface.ts`
- DSL MUST NOT import from code-generator

#### 4. NodeUIConfig Category Hardcoded

**File**: `src/shared/types/node.interface.ts`

`NodeUIConfig` has `category: "GMAIL" | "FORMS"` — a hardcoded union that MUST change every time a module is added.

**Violation**: Node Extensibility

**Required fix**: Change to `category: string` and let each module define its category identifier.

#### 5. Generator Contract Lacks Structure

**Files**: `src/features/modules/*/nodes/*/generator.ts`

Generators return raw strings. The form-submit generator embeds the entire function structure (`function setup()`, `function onFormSubmit(e)`), making it impossible for the compiler to control the output structure.

**Violation**: Compiler Independence, Separation of Concerns

**Required fix**: Generators SHOULD return structured snippets (e.g., `{ functionBody: string, setupCode?: string }`) so the compiler can assemble the final output.

#### 6. No Graph Validation in Transformer

**File**: `src/features/workflow-transformer/workflow-to-dsl.ts`

The transformer does a simple linear walk from trigger with no validation. No checks for: cycles, disconnected nodes, missing triggers, multiple triggers, branching.

**Violation**: Layered Architecture (transformer MUST validate before producing DSL)

**Required fix**: Add graph structure validation before DSL generation.

#### 7. Missing Shared Workflow Directory

The target architecture calls for `src/shared/workflow/` to hold the canonical types. This directory does not exist yet.

**Required fix**: Create `src/shared/workflow/` and move all DSL and config value types there.

### Tasks

- [ ] Create `src/shared/workflow/` directory
- [ ] Move DSL types (`WorkflowDSL`, `WorkflowDSLNode`) to `src/shared/workflow/`
- [ ] Move `ConfigValue` types to `src/shared/workflow/`
- [ ] Remove duplicate `bindings.interface.ts` from `src/shared/types/`
- [ ] Add `resolveNodeGenerator(type)` to shared registry for generic node lookup
- [ ] Introduce `CompilationTarget` interface in `src/shared/workflow/`
- [ ] Implement `AppsScriptTarget` implementing `CompilationTarget`
- [ ] Refactor compiler to use `CompilationTarget` and generic node resolution
- [ ] Change `NodeUIConfig.category` from hardcoded union to `string`
- [ ] Add graph validation in workflow transformer
- [ ] Improve generator contract (structured snippets)
- [ ] Review and update documentation

### Deliverables

- Clean architecture matching the target design
- Stable project structure with proper layer boundaries
- Updated documentation (overview.md, this file)
- All constitutional principles satisfied

---

# Phase 1

## Compiler Foundation

The goal of this phase is to build the core compiler pipeline.

---

## Spec 1.1

### Workflow Graph

Create the internal representation used by the visual editor.

Responsibilities:

- Nodes
- Edges
- Connections

Output:

Workflow Graph

---

## Spec 1.2

### Workflow Transformer

Convert Workflow Graph into Workflow DSL.

Responsibilities:

- Normalize graph
- Resolve execution order
- Validate graph structure

Output:

Workflow DSL

---

## Spec 1.3

### Workflow DSL

Design the canonical workflow representation.

The DSL should contain:

- Trigger
- Steps
- Variables
- Metadata

The DSL becomes the compiler input.

---

## Spec 1.4

### Compiler Core

Implement the compiler orchestrator.

Responsibilities:

- Traverse Workflow DSL
- Resolve node generators
- Build source tree
- Assemble output

The compiler should know nothing about Apps Script.

---

## Spec 1.5

### Compilation Targets

Introduce compiler targets.

Initial target:

- Apps Script

Future targets:

- Node.js
- Cloud Functions
- Edge Functions

Compiler architecture must support multiple targets from day one.

---

## Spec 1.6

### Registry / Factory

Implement dynamic generator resolution.

Responsibilities:

- Register node generators
- Resolve generators
- Remove compiler coupling

---

# Phase 2

## Node SDK

The purpose of this phase is to define how nodes are built.

After this phase, adding a new node should require minimal work.

---

## Spec 2.1

Node Contract

Every node must expose:

- Schema
- Validator
- UI Definition
- Generator

---

## Spec 2.2

Node Registry

Implement node registration and discovery.

---

## Spec 2.3

Validation Pipeline

Every node validates its own configuration.

Validation must never be implemented inside the compiler.

---

## Spec 2.4

Generator Contract

Every node generator returns a source snippet.

The compiler assembles snippets into the final program.

---

# Phase 3

## First Functional Modules

Only after the compiler is stable should actual modules be implemented.

---

## Module

Google Forms

### Spec

Form Submit Trigger

---

## Module

Gmail

### Spec

Send Email Node

---

### First End-to-End Workflow

```
Form Submitted
        ↓
Send Email
```

This is the first functional MVP.

---

# Phase 4

## Workflow Builder

Implement the visual editor.

Responsibilities:

- React Flow integration
- Node palette
- Connections
- Inspector
- Configuration panels

Output:

Workflow Graph

---

# Phase 6

## Templates

Implement reusable workflows.

Features:

- Templates
- Import
- Export
- Sharing

# Spec Execution Order

The following order should be respected.

```
00-project-review-and-refactor

01-workflow-graph

02-workflow-transformer

03-workflow-dsl

04-compiler-core

05-compilation-targets

06-node-registry

07-node-sdk

08-form-submit-trigger

09-send-email-node

10-workflow-builder

13-templates

```

---

# Success Criteria

The architecture is considered successful when:

- New modules can be added without modifying the compiler.
- New nodes can be added by implementing only the Node Contract.
- The compiler is independent from Google Workspace.
- Multiple compilation targets are supported.
- UI and compiler are completely decoupled.
- Every feature is delivered as an independent vertical slice.

---

# Long-Term Goal

The final system should evolve into a **Visual Workflow Compiler Platform**, where Google Apps Script is simply one compilation target among many.

The project should be architected from the beginning with extensibility, modularity, and maintainability as first-class design goals.
