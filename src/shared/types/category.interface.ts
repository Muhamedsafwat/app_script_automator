import { IconType } from "react-icons";
import { WorkflowNodeDefinition } from "./node.interface";

export interface ICategory {
  metadata: {
    category: string;
    icon: IconType;
    style: string;
  };
  nodes: WorkflowNodeDefinition<any>[];
}
