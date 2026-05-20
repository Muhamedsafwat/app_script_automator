import type { FormSubmitConfig } from "./schema";

export function generateFormSubmit(config: FormSubmitConfig) {
  return `
function setup() {
  const form =
    FormApp.openById(
      "${config.formId}"
    );

  ScriptApp.newTrigger(
    "onFormSubmit"
  )
    .forForm(form)
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {

}
`;
}
