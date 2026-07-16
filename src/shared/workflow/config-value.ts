export type StaticValue = {
  kind: "static";
  value: string;
};

export type BindingValue = {
  kind: "binding";
  sourceNodeId: string;
  sourceField: string;
};

export type ConfigValue = StaticValue | BindingValue;
