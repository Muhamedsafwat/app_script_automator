import { SiGmail } from "react-icons/si";
import { sendEmailNode } from "./send-mail";

export const gmailRegistry = {
  // metadata
  metadata: {
    category: "GMAIL",
    icon: SiGmail,
    style: "bg-white text-red-500",
  },
  [sendEmailNode.type]: sendEmailNode,
};
