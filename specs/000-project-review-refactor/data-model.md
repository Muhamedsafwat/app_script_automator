# Data Model: Phase 0 — Architecture Review & Refactor

**Date**: 2026-07-16
**Spec**: [spec.md](./spec.md)

## Entities

### 1. WorkflowDSL

The canonical intermediate representation of a workflow. Lives in `src/shared/workflow/workflow-dsl.ts`.

| Field | Type | Description |
|-------|------|-------------|
| `trigger` | `WorkflowDSLNode` | The single trigger node that initiates the workflow |
| `steps` | `WorkflowDSLNode[]` | Ordered list of action nodes to execute |

**Validation**: `trigger` MUST be present. `steps` MAY be empty (valid but produces no actions).

---

### 2. WorkflowDSLNode

A single node within the Workflow DSL. Lives in `src/shared/workflow/workflow-dsl.ts`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (UUID) |
| `type` | `string` | Node type identifier (e.g., `"form-submit"`, `"send-email"`) |
| `config` | `Record<string, ConfigValue>` | Node configuration with resolved binding/static values |

---

### 3. ConfigValue (Discriminated Union)

Polymorphic configuration value. Lives in `src/shared/workflow/config-value.ts`.

| Variant | Tag (`kind`) | Fields | Description |
|---------|-------------|--------|-------------|
| `StaticValue` | `"static"` | `value: unknown` | Literal value provided by the user |
| `BindingValue` | `"binding"` | `sourceNodeId: string`, `sourceField: string` | Reference to an upstream node's output field |

**Discriminant**: `kind` field. All consumers MUST use `kind` to narrow the type.

---

### 4. CompilationTarget (Interface)

Defines how a specific runtime receives and structures generated code. Lives in `src/shared/workflow/compilation-target.ts`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `wrapFunction` | `name: string, body: string` | `string` | Wraps a function body in target-specific function syntax |
| `wrapTriggerFunction` | `name: string, body: string` | `string` | Wraps a trigger handler (e.g., `onFormSubmit(e)`) |
| `resolveBinding` | `field: string` | `string` | Produces the runtime expression for reading a trigger's named value |
| `getSetupCode` | `snippets: CodeSnippet[]` | `string` | Assembles one-time setup code from node snippets |
| `getImports` | — | `string` | Returns import statements for the target runtime |

---

### 5. CodeSnippet

Structured output from a node generator. Lives in `src/shared/workflow/compilation-target.ts`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `functionBody` | `string` | Yes | The logic to place inside the workflow function body |
| `setupCode` | `string` | No | One-time initialization code (e.g., trigger registration) |

---

### 6. GraphValidationResult (Discriminated Union)

Outcome of validating a workflow graph. Lives in `src/shared/workflow/graph-validation.ts`.

| Variant | Tag (`valid`) | Fields | Description |
|---------|--------------|--------|-------------|
| `GraphValid` | `true` | — | Graph structure is valid |
| `GraphInvalid` | `false` | `errors: GraphError[]` | One or more structural errors found |

---

### 7. GraphError

A specific validation error. Lives in `src/shared/workflow/graph-validation.ts`.

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Error code: `"NO_TRIGGER"`, `"MULTIPLE_TRIGGERS"`, `"CYCLE_DETECTED"`, `"DISCONNECTED_NODES"` |
| `message` | `string` | Human-readable error description |
| `nodeIds` | `string[]` | IDs of nodes involved in the error (optional) |

---

### 8. WorkflowNodeDefinition (Modified)

Existing interface — `category` field type changes from hardcoded union to `string`. Lives in `src/shared/types/node.interface.ts`.

| Field | Type | Change |
|-------|------|--------|
| `category` | `string` | **Changed** from `"GMAIL" \| "FORMS"` to `string` |

---

### 9. NodeGenerator (Modified)

Existing type alias — return type changes from `string` to `CodeSnippet`. Lives in `src/shared/types/node.interface.ts`.

| Before | After |
|--------|-------|
| `(config: T) => string` | `(config: T) => CodeSnippet` |

---

### 10. NodeRegistry (Modified)

Existing structure — flattened registry gains a `resolveNode(type)` method. Lives in `src/shared/registry/node.registry.ts`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `resolveNode` | `type: string` | `WorkflowNodeDefinition \| undefined` | Searches all module registries for a node by type |

---

## Relationships

```
WorkflowDSL
 └─ contains ─→ WorkflowDSLNode (trigger)
 └─ contains ─→ WorkflowDSLNode[] (steps)
                  └─ config values ─→ ConfigValue (StaticValue | BindingValue)

CompilationTarget
 └─ consumed by ─→ Compiler (orchestrator)
 └─ produces ─→ generated source code

CodeSnippet
 └─ produced by ─→ NodeGenerator
 └─ consumed by ─→ CompilationTarget for assembly

GraphValidationResult
 └─ produced by ─→ validateGraph()
 └─ consumed by ─→ Workflow Transformer
```

---

## State Transitions

No state transitions in this phase — this is a type/interface refactoring, not a behavioral change. The entities above are all static type definitions.
