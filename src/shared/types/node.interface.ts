import { z } from "zod";

// ----------- Node Interface ------------- //
export interface WorkflowNodeDefinition<TSchema extends z.ZodTypeAny> {
  type: string;
  schema: TSchema;
  ui: NodeUIConfig<z.infer<TSchema>>;
  generator: NodeGenerator<z.infer<TSchema>>;
}

// --------------- Node UI config ----------- //
export interface NodeUIField<T> {
  key: keyof T;
  label: string;

  component: "input" | "textarea" | "select";
}

export interface NodeUIConfig<T> {
  metadata: {
    label: string;
    category: string;
  };
  fields: NodeUIField<T>[];
}

// ------------ Node generator ---------- //
export type NodeGenerator<T> = (config: T) => string;
