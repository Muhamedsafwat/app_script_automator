import { NodeUIConfig } from "@/shared/types/node.interface";

import { FormSubmitConfig } from "./schema";

export const formSubmitUI: NodeUIConfig<FormSubmitConfig> = {
  metadata: {
    label: "Form Submit",
    category: "FORMS",
  },
  fields: [
    {
      key: "formId",
      label: "Google Form ID",
      component: "input",
      type: "string",
      allowBindings: true,
    },
  ],
};
