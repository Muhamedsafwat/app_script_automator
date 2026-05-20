import { NodeUIConfig } from "@/shared/types/node.interface";
import { SendEmailConfig } from "./schema";
// icons
import { SiGmail } from "react-icons/si";


export const sendEmailUI: NodeUIConfig<SendEmailConfig> = {
    // metadata
    metadata: {
        label: "Send Email",
        icon: SiGmail, 
        category: "Gmail",
    },
    // input fields
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