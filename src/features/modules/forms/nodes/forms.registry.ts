import { formSubmitNode } from "./form-submit";
import { SiGoogleforms } from "react-icons/si";

export const formsRegistry = {
  // metadata
  metadata: {
    category: "FORMS",
    icon: SiGoogleforms,
    style: "bg-white text-green-500",
  },
  [formSubmitNode.type]: formSubmitNode,
};
