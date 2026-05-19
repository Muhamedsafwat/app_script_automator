# Visual Google Apps Script Automation Builder — Architecture Notes

## Overview

This document summarizes the architecture and design decisions for a visual workflow automation platform that generates and deploys Google Apps Script code from a drag-and-drop UI.

The goal is to build a **modular, extensible, compiler-based system** that allows users to create automations like:

- Google Forms → Send Email
- Google Forms → Update Sheets → Send Email
- Webhook → Gmail → Sheets logging

---

# 1. Core Idea

We are NOT building a general-purpose automation platform like n8n.

Instead, we are building:

> A domain-specific visual builder for Google Workspace automation that compiles workflows into Google Apps Script.

# 2. High-Level Architecture

```
UI Layer (React Flow)
↓
Workflow Graph (nodes + edges)
↓
Workflow Transformer
↓
Workflow DSL (JSON representation)
↓
Compiler (Apps Script Generator)
↓
Node Generators
↓
Generated Apps Script Code
↓
Google Apps Script Runtime

```

---

# 3. Key Concepts

## 3.1 Node

A Node is a single unit of work inside a workflow.

Examples:

- form_submit (trigger)
- send_email (action)
- append_sheet (action)

Each node contains:

- schema
- validation logic
- UI configuration
- code generator

---

## 3.2 Module

A Module represents an integration domain (Google service).

Examples:

- Gmail module
- Forms module
- Sheets module

Each module provides multiple nodes.

Example:

```

gmail/
send-email
draft-email
forms/
form-submit-trigger

```

---

## 3.3 Workflow DSL (Domain Representation)

The DSL is a normalized representation of the workflow.

It is NOT separate from JSON — the JSON itself is the DSL.

Example:

```json
{
  "trigger": {
    "type": "form_submit"
  },
  "steps": [
    {
      "type": "send_email",
      "config": {
        "to": "{{form.email}}",
        "subject": "Thanks",
        "body": "We received your submission"
      }
    }
  ]
}
```

This is called:

- Workflow DSL
- Workflow Definition
- Intermediate Representation (IR)

---

# 4. Compiler Architecture

The compiler is responsible for transforming DSL → executable Apps Script code.

## Responsibilities:

- Traverse workflow DSL
- Maintain execution order
- Build function structure
- Delegate code generation to node generators
- Assemble final script

---

## Compiler Flow

```ts
for (const step of workflow.steps) {
  const generator = NodeGeneratorFactory.create(step.type);
  const snippet = generator.generate(step);
  code += snippet;
}
```

---

# 5. Node Generator System

Each node has its own generator.

Example structure:

```
send-email/
  schema.ts
  validator.ts
  generator.ts
  ui.ts
```

## Responsibilities:

- Validate node config
- Generate Apps Script code snippet
- Encapsulate node-specific logic

---

# 6. Factory / Registry Pattern

The factory (or registry) is responsible for selecting the correct node generator dynamically.

## Example:

```ts
const generator = NodeGeneratorFactory.create(step.type);
```

or registry-based:

```ts
const generator = registry[step.type];
```

## Purpose:

- Avoid hardcoded if/else logic
- Enable extensibility
- Support plugin-like architecture in the future

---

# 7. Code Generator Service (Compiler Core)

The main generator service acts as the orchestrator.

## Responsibilities:

- Accept Workflow DSL
- Iterate over steps
- Resolve correct node generators
- Collect generated code snippets
- Wrap into final Apps Script function
- Output deployable script

---

## Example:

```ts
class AppsScriptCompiler {
  generate(workflow) {
    const stepsCode = workflow.steps
      .map((step) => {
        const generator = NodeGeneratorFactory.create(step.type);
        return generator.generate(step);
      })
      .join("\n");

    return `
      function onFormSubmit(e) {
        ${stepsCode}
      }
    `;
  }
}
```

---

# 8. UI Layer

Built using a visual node-based editor (e.g. React Flow).

Responsibilities:

- Drag & drop nodes
- Connect edges
- Configure node parameters
- Produce workflow graph (nodes + edges)

---

# 9. Transformation Layer

Converts UI graph into DSL.

```
Graph (nodes + edges)
        ↓
Workflow DSL
```

This layer decouples UI from compiler logic.

---

# 10. Module System

Modules represent Google Workspace integrations.

Examples:

- Gmail
- Google Forms
- Google Sheets
- Google Calendar

Each module provides:

- nodes
- schemas
- generators
- UI definitions

---

# 11. Recommended Project Structure

```
src/

  features/

    modules/
      gmail/
        nodes/
          send-email/

      forms/
        nodes/
          form-submit-trigger/

    workflow-builder/
    workflow-engine/
    code-generator/
    deployment/

  shared/
    workflow/
      types.ts
```

---

# 12. Architecture Principles

## 12.1 Separation of Concerns

- UI ≠ DSL ≠ Compiler ≠ Generators

## 12.2 Extensibility

- New nodes should not modify compiler

## 12.3 Composition over Hardcoding

- No if/else chains for node types

## 12.4 Vertical Slice Development

Each module is built end-to-end:

```
UI → DSL → Compiler → Execution
```

---

# 13. Development Strategy (MVP Plan)

## Phase 1 (Core Proof of Concept)

- Send Email Node
- Form Submit Trigger Node
- Manual Apps Script execution

## Phase 2

- DSL implementation
- Basic compiler
- Node registry

## Phase 3

- UI builder (React Flow)
- Google OAuth integration
- Auto deployment

## Phase 4

- Add more modules (Sheets, Calendar)
- Templates system
- Plugin architecture

---

# 14. Key Insight

This system is not just a code generator.

It is:

> A visual compiler that translates workflows into Google Apps Script runtime executions.

---
