import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "./config.js";
import { downloadsDir } from "./paths.js";
import { sendCertificateEmail } from "./mailer.js";
import { readStatus, writeStatus } from "./statusStore.js";

const PDF_SIGNATURE = "%PDF";

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function arrayBufferStartsWithPdf(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const signature = String.fromCharCode(...bytes);
  return signature === PDF_SIGNATURE;
}

function looksLikePdf(response, buffer) {
  const contentType = response.headers.get("content-type") || "";
  return (
    contentType.toLowerCase().includes("application/pdf") ||
    arrayBufferStartsWithPdf(buffer)
  );
}

async function saveCertificate(buffer, config) {
  await fs.mkdir(downloadsDir, { recursive: true });
  const certificatePath = path.join(downloadsDir, config.downloadFilename);
  await fs.writeFile(certificatePath, Buffer.from(buffer));
  return certificatePath;
}

export async function checkCertificate(options = {}) {
  const config = options.config || getConfig();
  const checkedAtDate = new Date();
  const checkedAt = checkedAtDate.toISOString();
  const nextCheckAt = options.includeNextCheck
    ? addMinutes(checkedAtDate, config.intervalMinutes).toISOString()
    : null;

  const previousStatus = await readStatus();

  try {
    if (!config.checkUrl) {
      throw new Error(
        "Certificate URL is not configured. Set MCM_TEAM_NUMBER in .env, or set CHECK_URL directly."
      );
    }

    const response = await fetch(config.checkUrl, {
      method: "GET",
      headers: {
        "accept": "application/pdf,text/html;q=0.9,*/*;q=0.8",
        "user-agent":
          "MCM-Certificate-Monitor/1.0 (+local certificate availability checker)"
      },
      redirect: "follow"
    });

    const contentType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length");
    const buffer = await response.arrayBuffer();
    const isPdf = response.ok && looksLikePdf(response, buffer);

    if (!isPdf) {
      return writeStatus({
        ...previousStatus,
        state: "pending",
        message: "Certificate has not been published yet.",
        checkUrl: config.checkUrl,
        lastCheckedAt: checkedAt,
        nextCheckAt,
        httpStatus: response.status,
        contentType,
        contentLength: contentLength ? Number(contentLength) : buffer.byteLength,
        isPublished: false,
        lastError: null,
        emailError: null
      });
    }

    const certificatePath =
      previousStatus.downloadedPath ||
      (await saveCertificate(buffer, config));

    let notified = previousStatus.notified;
    let emailError = null;
    if (!notified) {
      try {
        await sendCertificateEmail({
          config,
          certificatePath,
          checkedAt
        });
        notified = true;
      } catch (error) {
        emailError = error.message;
      }
    }

    return writeStatus({
      ...previousStatus,
      state: emailError ? "published_email_failed" : "published",
      message: emailError
        ? "Certificate downloaded, but email notification failed."
        : "Certificate has been published and downloaded.",
      checkUrl: config.checkUrl,
      lastCheckedAt: checkedAt,
      nextCheckAt,
      httpStatus: response.status,
      contentType,
      contentLength: contentLength ? Number(contentLength) : buffer.byteLength,
      isPublished: true,
      notified,
      downloadedPath: certificatePath,
      lastError: null,
      emailError
    });
  } catch (error) {
    return writeStatus({
      ...previousStatus,
      state: "error",
      message: "Check failed. The monitor will retry later.",
      checkUrl: config.checkUrl,
      lastCheckedAt: checkedAt,
      nextCheckAt,
      lastError: error.message
    });
  }
}
