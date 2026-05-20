import { SendEmailConfig } from "./schema";

export function generateSendEmail(config: SendEmailConfig) {
  return `
    GmailApp.sendEmail(
      "${config.to}",
      "${config.subject}",
      "${config.body}"
    );
  `;
}
