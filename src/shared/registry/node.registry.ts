import { sendEmailNode } from "@/features/modules/gmail/nodes/send-mail";

export const nodeRegistry = {
  [sendEmailNode.type]: sendEmailNode,
};

export const nodeIconStyleRegistry = {
  GMAIL: "bg-white text-red-500",
};
