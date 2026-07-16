# Contract: CompilationTarget Interface

**Purpose**: Define the interface that all compilation targets must implement.
**Layer**: Shared (consumed by compiler, implemented by targets)

## Interface Definition

```typescript
interface CompilationTarget {
  /**
   * Wraps a function body in target-specific function syntax.
   * @param name - Function name (e.g., "processForm")
   * @param body - The function body code (from node generators)
   * @returns Complete function string
   */
  wrapFunction(name: string, body: string): string;

  /**
   * Wraps a trigger handler function.
   * @param name - Handler name (e.g., "onFormSubmit")
   * @param body - The handler body code
   * @returns Complete trigger handler string
   */
  wrapTriggerFunction(name: string, body: string): string;

  /**
   * Produces the runtime expression for reading a trigger's named value.
   * @param field - The field name to read from the trigger event
   * @returns Expression string (e.g., "e.namedValues['email'][0]")
   */
  resolveBinding(field: string): string;

  /**
   * Assembles one-time setup code from node setup snippets.
   * @param snippets - Array of setup code strings from nodes
   * @returns Assembled setup code string
   */
  getSetupCode(snippets: string[]): string;

  /**
   * Returns import statements for the target runtime.
   * @returns Import string (empty for runtimes without import systems)
   */
  getImports(): string;
}
```

## Implementations

### AppsScriptTarget

| Method | Implementation |
|--------|---------------|
| `wrapFunction(name, body)` | `` function ${name}() { ${body} } `` |
| `wrapTriggerFunction(name, body)` | `` function ${name}(e) { ${body} } `` |
| `resolveBinding(field)` | `` e.namedValues['${field}'][0] `` |
| `getSetupCode(snippets)` | Joins snippets with `\n` |
| `getImports()` | `""` (empty — Apps Script has no imports) |

## Consumer: Compiler

The compiler calls these methods during code assembly:

```
1. target.getImports()
2. target.getSetupCode(collectSetupCodeFromNodes())
3. target.wrapTriggerFunction("onFormSubmit", assembleBody())
4. target.wrapFunction("setup", assembleSetupBody())
```

## Validation

- All implementations MUST satisfy the `CompilationTarget` interface.
- The compiler MUST NOT reference any implementation directly — only the interface.
