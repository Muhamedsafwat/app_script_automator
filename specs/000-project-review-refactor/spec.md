# Feature Specification: Phase 0 — Architecture Review & Refactor

**Feature Branch**: `000-project-review-refactor`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Read @PLAN.md and create a specification for the Phase 0 ONLY."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Decouple Compiler from Module Registries (Priority: P1)

As a platform developer, I want the compiler to resolve node generators through a generic registry lookup so that adding or removing a module never requires changing compiler code.

**Why this priority**: The compiler currently hardcodes references to `formsRegistry` and `gmailRegistry`. This is the most critical violation because it prevents the system from scaling to new modules and breaks the fundamental Compiler Independence principle.

**Independent Test**: Can be verified by confirming that the compiler source file contains zero imports from any `features/modules/` directory, and that all node lookups go through a single generic resolution function.

**Acceptance Scenarios**:

1. **Given** the compiler needs to resolve a node generator, **When** it receives a node type string, **Then** it finds the correct generator through a generic registry lookup without knowing which modules exist.
2. **Given** a new module (e.g., Sheets) is added to the registry, **When** the compiler processes a workflow containing a Sheets node, **Then** the compiler resolves the generator without any code changes.
3. **Given** a module is removed from the registry, **When** the compiler processes a workflow, **Then** it reports a clear error for the missing node type rather than failing with an import error.

---

### User Story 2 — Introduce Compilation Target Abstraction (Priority: P1)

As a platform developer, I want a `CompilationTarget` interface so that the compiler can produce output for different runtimes (Apps Script, Node.js, etc.) without modification.

**Why this priority**: The target architecture requires multi-target support from day one. Currently the compiler embeds Apps Script-specific logic (function wrapping, runtime binding syntax) directly. This blocks all future target work.

**Independent Test**: Can be verified by confirming that a `CompilationTarget` interface exists, that an Apps Script implementation satisfies it, and that the compiler uses only interface methods — never Apps Script-specific code.

**Acceptance Scenarios**:

1. **Given** the compiler assembles output, **When** it wraps a function, **Then** it delegates to the active `CompilationTarget`'s wrapping method.
2. **Given** the compiler resolves a runtime binding (e.g., form submit event data), **When** it generates the binding expression, **Then** it uses the target's binding method rather than hardcoding `e.namedValues['field'][0]`.
3. **Given** a developer wants to add a Node.js target, **When** they implement the `CompilationTarget` interface, **Then** they can swap the target without modifying the compiler.

---

### User Story 3 — Relocate Shared Types to Correct Layer (Priority: P2)

As a platform developer, I want all shared types (DSL, ConfigValue, NodeInput) to live in `src/shared/workflow/` so that dependency direction flows correctly across layers.

**Why this priority**: The DSL types are currently split between `workflow-transformer/types/` and `code-generator/types/`, creating a backward dependency where the DSL imports from the code generator. This violates layered architecture and makes the types unavailable to future layers.

**Independent Test**: Can be verified by confirming that `src/shared/workflow/` exists, that all DSL and config value types reside there, and that no feature directory contains types that should be shared.

**Acceptance Scenarios**:

1. **Given** a developer needs the `WorkflowDSL` type, **When** they import it, **Then** the import path is `@/shared/workflow/` (not a feature-specific path).
2. **Given** the transformer produces a DSL, **When** it imports the DSL type, **Then** it imports from `src/shared/workflow/`, not from the code generator.
3. **Given** the compiler consumes the DSL, **When** it imports the DSL type, **Then** it imports from `src/shared/workflow/`.
4. **Given** duplicate type definitions exist (e.g., `bindings.interface.ts`), **When** the refactor is complete, **Then** only one canonical definition remains.

---

### User Story 4 — Remove Hardcoded Category Constraint (Priority: P2)

As a module developer, I want `NodeUIConfig` to accept any string as a category so that adding a new module does not require modifying shared type definitions.

**Why this priority**: The current `category: "GMAIL" | "FORMS"` union forces a type change in shared code every time a module is added, violating Node Extensibility.

**Independent Test**: Can be verified by confirming that `NodeUIConfig.category` is typed as `string` and that existing modules still work without type errors.

**Acceptance Scenarios**:

1. **Given** a new module (e.g., Sheets) defines a node with `category: "SHEETS"`, **When** the type is checked, **Then** no compilation error occurs.
2. **Given** existing Gmail and Forms modules, **When** the refactor is complete, **Then** all existing nodes remain valid and functional.

---

### User Story 5 — Add Graph Validation to Transformer (Priority: P2)

As a platform developer, I want the workflow transformer to validate graph structure before producing a DSL so that malformed workflows produce clear error messages instead of silent failures or broken output.

**Why this priority**: The current transformer does a simple linear walk with no validation. It silently ignores disconnected nodes, multiple triggers, and cycles — all of which would produce invalid or incomplete DSL output.

**Independent Test**: Can be verified by feeding malformed graphs (no trigger, multiple triggers, disconnected nodes, cycles) to the transformer and confirming clear error messages are produced.

**Acceptance Scenarios**:

1. **Given** a workflow graph has no trigger node, **When** transformation is attempted, **Then** an error is returned stating that a trigger is required.
2. **Given** a workflow graph has multiple trigger nodes, **When** transformation is attempted, **Then** an error is returned stating that only one trigger is allowed.
3. **Given** a workflow graph contains a cycle, **When** transformation is attempted, **Then** an error is returned identifying the cycle.
4. **Given** a workflow graph has nodes unreachable from the trigger, **When** transformation is attempted, **Then** a warning or error identifies the disconnected nodes.
5. **Given** a valid linear workflow (trigger → step → step), **When** transformation runs, **Then** the DSL is produced correctly.

---

### User Story 6 — Improve Generator Contract (Priority: P3)

As a compiler developer, I want node generators to return structured code snippets (not raw strings) so that the compiler can control the overall program structure while nodes contribute only their logic.

**Why this priority**: The form-submit generator currently embeds the entire function skeleton (`function setup()`, `function onFormSubmit(e)`), which means the compiler has no control over the output structure. This makes it impossible for different compilation targets to produce different program layouts.

**Independent Test**: Can be verified by confirming that generators return a structured object with at least `functionBody` (and optionally `setupCode`), and that the compiler assembles these into the final output.

**Acceptance Scenarios**:

1. **Given** a node generator produces code, **When** it returns its result, **Then** the result is a structured object containing `functionBody` and optional `setupCode`.
2. **Given** the compiler receives structured snippets, **When** it assembles the final output, **Then** it uses the active `CompilationTarget` to wrap the function body and prepend any setup code.
3. **Given** the existing form-submit node, **When** its generator is updated, **Then** it returns only the trigger setup logic (not the entire function wrapper).

---

### Edge Cases

- What happens when a workflow graph has a trigger but zero steps? (Should produce a valid DSL with an empty steps array, or warn that no actions will execute.)
- What happens when the registry is empty (no modules registered)? (The compiler should fail with a clear "no modules available" error.)
- What happens when a node's generator throws an error? (The compiler should catch it and report which node failed, with the node's ID and type.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a generic `resolveNodeGenerator(type: string)` function that searches all registered module registries to find a node definition.
- **FR-002**: Compiler MUST NOT contain any imports from `src/features/modules/`, `src/features/workflow-builder/`, or any UI framework code.
- **FR-003**: System MUST define a `CompilationTarget` interface with methods for wrapping functions, generating setup code, and producing runtime binding expressions.
- **FR-004**: System MUST implement an `AppsScriptTarget` that satisfies the `CompilationTarget` interface with Google Apps Script-specific behavior.
- **FR-005**: All shared types (`WorkflowDSL`, `WorkflowDSLNode`, `ConfigValue`, `StaticValue`, `BindingValue`) MUST reside in `src/shared/workflow/`.
- **FR-006**: Duplicate type definitions (e.g., in `src/shared/types/bindings.interface.ts`) MUST be removed; a single canonical source MUST exist.
- **FR-007**: `NodeUIConfig.category` MUST accept any string value — not a hardcoded union of module names.
- **FR-008**: Workflow transformer MUST validate graph structure before DSL generation, checking for: missing trigger, multiple triggers, cycles, and disconnected nodes.
- **FR-009**: Node generators MUST return structured code snippets (`{ functionBody: string, setupCode?: string }`) rather than raw strings.
- **FR-010**: Compiler MUST use the active `CompilationTarget` for all runtime-specific code generation (function wrapping, binding expressions, setup code).
- **FR-011**: All existing module functionality (Gmail send-email, Forms form-submit) MUST continue to work after refactoring — no feature regression.
- **FR-012**: System MUST maintain the existing `@/` path alias configuration for module resolution.

### Key Entities

- **CompilationTarget**: Interface defining how a specific runtime receives and structures generated code. Methods include function wrapping, setup code generation, and runtime binding resolution.
- **NodeRegistry**: A unified registry aggregating all module registries. Provides a single `resolve(type)` method to look up any node definition by its type string.
- **WorkflowDSL**: The canonical intermediate representation of a workflow. Lives in shared scope; consumed by the compiler, produced by the transformer.
- **GraphValidationResult**: The outcome of validating a workflow graph structure — either success or a list of specific errors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero imports from module-specific code in the compiler source files.
- **SC-002**: All shared types accessible from a single import path (`@/shared/workflow/`).
- **SC-003**: Adding a hypothetical third module (e.g., Sheets) requires zero changes to shared types or compiler code.
- **SC-004**: All five graph validation scenarios (no trigger, multiple triggers, cycle, disconnected, valid) produce the expected outcome.
- **SC-005**: The existing "Form Submit → Send Email" workflow compiles and produces identical output before and after refactoring.
- **SC-006**: TypeScript compilation succeeds with zero errors after all refactoring tasks are complete.
- **SC-007**: ESLint passes with no errors after refactoring.

## Assumptions

- The existing prototype code (ReactFlow UI, Zustand store, config form) is considered in-scope for regression testing but NOT in-scope for refactoring — Phase 0 targets only the architecture layers (types, compiler, transformer, registry).
- The project uses TypeScript with strict mode (as specified in the constitution).
- The `@/` path alias is already configured in `tsconfig.json` and Vite config.
- No deployment or CI/CD infrastructure exists yet — validation is manual (TypeScript build + ESLint).
- The "Form Submit → Send Email" end-to-end workflow is the primary regression test case.
