import { NodeUIConfig } from "@/shared/types/node.interface";
import { SendEmailConfig } from "./schema";

export const sendEmailUI: NodeUIConfig<SendEmailConfig> = {
  // input fields
  metadata: {
    label: "Send Email",
    category: "GMAIL",
  },
  fields: [
    {
      key: "to",
      label: "Recipient",
      component: "input",
      type: "email",
      allowBindings: true,
    },
    {
      key: "subject",
      label: "Subject",
      component: "input",
      type: "string",
      allowBindings: true,
    },
    {
      key: "body",
      label: "Body",
      component: "textarea",
      type: "string",
      allowBindings: true,
    },
  ],
};
