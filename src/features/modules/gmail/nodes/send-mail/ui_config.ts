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
    },
    {
      key: "subject",
      label: "Subject",
      component: "input",
    },
    {
      key: "body",
      label: "Body",
      component: "textarea",
    },
  ],
};
