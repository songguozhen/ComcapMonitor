import nodemailer from "nodemailer";
import { isEmailConfigured } from "./config.js";

export async function sendCertificateEmail({ config, certificatePath, checkedAt }) {
  if (!isEmailConfigured(config)) {
    throw new Error(
      "SMTP is not configured. Fill SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, and MAIL_TO in .env."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.smtp.to,
    subject: "MCM/ICM 2026 Certificate Published",
    text: [
      "The MCM/ICM 2026 certificate appears to be published.",
      "",
      `Certificate URL: ${config.checkUrl}`,
      `Downloaded path: ${certificatePath}`,
      `Checked at: ${checkedAt}`,
      "",
      "The PDF is attached to this email."
    ].join("\n"),
    attachments: [
      {
        filename: config.downloadFilename,
        path: certificatePath,
        contentType: "application/pdf"
      }
    ]
  });
}
