export interface BindingValue {
  kind: "binding";
  sourceNodeId: string;
  sourceField: string;
}

export interface StaticValue {
  kind: "static";
  value: unknown;
}

export type NodeInputValue = StaticValue | BindingValue;
