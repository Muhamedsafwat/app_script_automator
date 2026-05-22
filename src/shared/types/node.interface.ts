import { z } from "zod";

// ----------- Node Interface ------------- //
export interface WorkflowNodeDefinition<TSchema extends z.ZodTypeAny> {
  type: string;
  kind: "step" | "trigger";
  schema: TSchema;
  ui: NodeUIConfig<z.infer<TSchema>>;
  generator: NodeGenerator<z.infer<TSchema>>;
  output?: NodeOutput[] | null;
  canHaveOutput?: boolean;
}

// --------------- Node UI config ----------- //
export type FieldType = "string" | "email" | "number" | "boolean";

export interface NodeUIField<T> {
  key: keyof T;
  label: string;
  component: "input" | "textarea" | "select";
  type: FieldType;
  allowBindings?: boolean;
}

export interface NodeUIConfig<T> {
  metadata: {
    label: string;
    category: "GMAIL" | "FORMS";
  };
  fields: NodeUIField<T>[];
}

export interface NodeOutput {
  name: string;
  type: FieldType;
}

// ------------ Node generator ---------- //
export type NodeGenerator<T> = (config: T) => string;
