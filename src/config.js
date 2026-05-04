import "dotenv/config";

const toBool = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function getConfig(overrides = {}) {
  const env = { ...process.env, ...overrides };
  const teamNumber = env.MCM_TEAM_NUMBER || "";
  const certificateBaseUrl =
    env.CERT_BASE_URL || "https://www.comap-math.org/mcm/2026Certs";
  const checkUrl =
    env.CHECK_URL ||
    (teamNumber
      ? `${certificateBaseUrl.replace(/\/$/, "")}/${teamNumber}.pdf`
      : "");

  return {
    port: toInt(env.PORT, 3000),
    checkUrl,
    intervalMinutes: toInt(env.CHECK_INTERVAL_MINUTES, 15),
    downloadFilename: env.DOWNLOAD_FILENAME || "certificate.pdf",
    smtp: {
      host: env.SMTP_HOST || "",
      port: toInt(env.SMTP_PORT, 465),
      secure: toBool(env.SMTP_SECURE, true),
      user: env.SMTP_USER || "",
      pass: env.SMTP_PASS || "",
      from: env.MAIL_FROM || env.SMTP_USER || "",
      to: env.MAIL_TO || ""
    }
  };
}

export function isEmailConfigured(config) {
  const smtp = config.smtp;
  return Boolean(
    smtp.host && smtp.port && smtp.user && smtp.pass && smtp.from && smtp.to
  );
}
