# Research: Phase 0 — Architecture Review & Refactor

**Date**: 2026-07-16
**Spec**: [spec.md](./spec.md)

## Research Area 1: Generic Node Resolution Strategy

### Decision

Introduce a `resolveNodeDefinition(type: string)` function in `src/shared/registry/node.registry.ts` that iterates over all registered module registries and returns the matching `WorkflowNodeDefinition`.

### Rationale

The compiler currently hardcodes `nodeRegistry.formsRegistry[dsl.trigger.type]` and `nodeRegistry.gmailRegistry[step.type]`. This creates direct coupling to specific modules. A generic lookup function eliminates this coupling and satisfies Principle I (Compiler Independence) and Principle V (Composition over Hardcoding).

### Alternatives Considered

- **Map-based registry**: Store all nodes in a flat `Map<string, WorkflowNodeDefinition>` pre-populated at import time. Rejected because it loses the category metadata grouping that the UI layer depends on.
- **Dynamic import**: Use `import()` to dynamically load modules. Rejected because it introduces async complexity and breaks the current synchronous architecture. The number of modules is small enough that static registration is pragmatic.

### Implementation Notes

The existing `nodeRegistry` structure (`{ gmailRegistry, formsRegistry }`) is preserved for the UI layer. The generic resolver iterates `Object.values(nodeRegistry)`, checks if the type key exists (excluding `metadata`), and returns the definition. This is an O(n) scan over module registries — acceptable given the small number of modules.

---

## Research Area 2: CompilationTarget Interface Design

### Decision

Define a `CompilationTarget` interface with these methods:

```typescript
interface CompilationTarget {
  wrapFunction(name: string, body: string): string;
  wrapTriggerFunction(name: string, body: string): string;
  resolveBinding(field: string): string;
  getSetupCode(nodes: CodeSnippet[]): string;
  getImports(): string;
}
```

### Rationale

The compiler needs to delegate all runtime-specific code generation to the target. Currently, the form-submit generator embeds `function setup()` and `function onFormSubmit(e)` — these are Apps Script-specific structural concerns that should be controlled by the target, not the node generator.

### Alternatives Considered

- **Template-based approach**: Use string templates for each target. Rejected because it doesn't compose well when targets have different structural requirements (Apps Script uses global functions, Node.js uses module exports).
- **Plugin system**: Full plugin architecture for targets. Rejected as over-engineering for Phase 0 — the interface abstraction is sufficient and can evolve into plugins later.

### Implementation Notes

The `AppsScriptTarget` implementation handles:
- `wrapFunction`: Produces `function name() { ... }` (global function, Apps Script style)
- `wrapTriggerFunction`: Produces `function onFormSubmit(e) { ... }` with trigger-specific wrapping
- `resolveBinding`: Produces `e.namedValues['field'][0]` (Apps Script event data access)
- `getSetupCode`: Produces the `ScriptApp.newTrigger()` setup block
- `getImports`: Empty (Apps Script has no import system)

---

## Research Area 3: Shared Type Location Strategy

### Decision

Create `src/shared/workflow/` with a barrel `index.ts` that re-exports all canonical types:
- `WorkflowDSL`, `WorkflowDSLNode` (from `workflow-transformer/types/`)
- `ConfigValue`, `StaticValue`, `BindingValue` (from `code-generator/types/`)
- `CompilationTarget`, `CodeSnippet` (new)
- `GraphValidationResult` (new)

### Rationale

The constitution (Principle IV) explicitly requires: "The DSL types MUST live in `src/shared/workflow/` — not in any feature-specific directory." The current split between `workflow-transformer/types/` and `code-generator/types/` creates a backward dependency (DSL imports from code-generator) that violates layer boundaries.

### Alternatives Considered

- **Keep types in transformer**: Place all types in `workflow-transformer/types/` since the transformer produces the DSL. Rejected because it creates a circular dependency when the compiler (a different layer) needs to import DSL types.
- **Keep types in code-generator**: Place all types in `code-generator/types/`. Rejected because it gives ownership of shared contracts to one consumer, preventing other layers from importing without coupling.

### Implementation Notes

The old type files in `workflow-transformer/types/` and `code-generator/types/` will be deleted after moving. All imports across the codebase will be updated to reference `@/shared/workflow/`. The barrel export pattern ensures consumers can import from a single path.

---

## Research Area 4: Generator Contract Evolution

### Decision

Change the `NodeGenerator<T>` return type from `string` to `CodeSnippet`:

```typescript
interface CodeSnippet {
  functionBody: string;
  setupCode?: string;
}
```

### Rationale

The form-submit generator currently returns the entire function skeleton including `function setup()` and `function onFormSubmit(e)`. This means the compiler has zero control over the output structure. By returning only `functionBody` (the logic inside the function) and optional `setupCode` (one-time initialization), the compiler and target can control the program structure while nodes provide only their logic.

### Alternatives Considered

- **AST-based snippets**: Return Abstract Syntax Tree nodes instead of strings. Rejected as too complex for Phase 0 — string-based snippets are sufficient and can be upgraded to AST later.
- **No change**: Keep raw string generators. Rejected because it makes multi-target compilation impossible — different targets need different program structures.

### Implementation Notes

The `send-email` generator changes from returning a raw string to returning `{ functionBody: "GmailApp.sendEmail(...);" }`. The `form-submit` generator changes from returning the full setup+handler code to returning `{ functionBody: "...", setupCode: "ScriptApp.newTrigger(...)..." }`. The compiler collects all `setupCode` snippets and delegates to the target for final assembly.

---

## Research Area 5: Graph Validation Strategy

### Decision

Add a `validateGraph(nodes, edges)` function that returns a `GraphValidationResult` (success or error list). The transformer calls this before DSL generation.

### Rationale

The current transformer silently produces incomplete or invalid DSL when the graph is malformed. Adding explicit validation catches errors early and produces clear messages for the user.

### Validation Rules

1. **Exactly one trigger**: Error if zero triggers or multiple triggers.
2. **No cycles**: Error if the graph contains a cycle (DFS-based detection).
3. **All nodes reachable**: Warning for nodes not connected to the trigger via any path.
4. **Steps must follow trigger**: The first edge must originate from the trigger node.

### Alternatives Considered

- **Schema-based validation**: Define the graph schema in Zod and validate against it. Rejected because graph structure validation (cycles, reachability) is better handled by algorithmic checks than schema validation.
- **Runtime error handling**: Let the compiler fail on invalid graphs. Rejected because it produces unclear error messages — validation should happen at the transformer layer with descriptive errors.

### Implementation Notes

The validation function is pure — it takes `nodes[]` and `edges[]` and returns a result. No side effects. Cycle detection uses DFS with a visited set. Reachability uses BFS from the trigger node. This function lives in `src/shared/workflow/graph-validation.ts` for testability.
