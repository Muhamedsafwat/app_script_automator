# Contract: NodeRegistry

**Purpose**: Define how nodes are registered and resolved across all modules.
**Layer**: Shared (consumed by compiler, UI, and transformer)

## Structure

```typescript
// Each module registry (e.g., gmailRegistry, formsRegistry) contains:
interface ModuleRegistry {
  metadata: {
    category: string;
    icon: IconType;
    style: string;
  };
  [nodeType: string]: WorkflowNodeDefinition | ModuleMetadata;
}

// The unified node registry aggregates all module registries:
const nodeRegistry: Record<string, ModuleRegistry> = {
  gmailRegistry,
  formsRegistry,
  // future: sheetsRegistry, calendarRegistry, ...
};
```

## Methods

### resolveNode(type: string): WorkflowNodeDefinition | undefined

Searches all module registries for a node definition matching the given type string.

**Behavior**:
1. Iterates `Object.values(nodeRegistry)`.
2. For each module registry, checks if `type` exists as a key (excluding `metadata`).
3. Returns the first match, or `undefined` if not found.

**Performance**: O(n) where n = total nodes across all modules. Acceptable for the expected scale (<100 nodes).

**Error handling**: Returns `undefined` — the caller (compiler) is responsible for producing an error message.

## Consumer: Compiler

```typescript
const nodeDef = resolveNode(type);
if (!nodeDef) {
  throw new Error(`Node type "${type}" not found in any registered module`);
}
```

## Consumer: UI (SideBar, Node component)

The UI continues to use the existing `nodeRegistry` structure for category grouping and icon display. The `resolveNode` function is an additional entry point for flat lookups.

## Adding a New Module

To register a new module:

1. Create `src/features/modules/<name>/nodes/<name>.registry.ts`
2. Export a `ModuleRegistry` object with `metadata` and node definitions
3. Import and add to `src/shared/registry/node.registry.ts`

No changes to the compiler, transformer, or shared types are required.
