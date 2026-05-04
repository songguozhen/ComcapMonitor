import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { afterEach, beforeEach, test } from "node:test";
import { checkCertificate } from "../src/monitor.js";
import { dataDir, downloadsDir } from "../src/paths.js";

const pdfBody = Buffer.from("%PDF-1.4\nmock certificate\n%%EOF\n");
let server;
let baseUrl;

function listen(handler) {
  return new Promise((resolve) => {
    server = http.createServer(handler);
    server.listen(0, () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
}

async function cleanRuntimeFiles() {
  await fs.rm(dataDir, { recursive: true, force: true });
  await fs.rm(downloadsDir, { recursive: true, force: true });
}

beforeEach(cleanRuntimeFiles);

afterEach(async () => {
  await new Promise((resolve) => server?.close(resolve));
  server = null;
  await cleanRuntimeFiles();
});

test("marks a 404 html response as pending", async () => {
  await listen((_req, res) => {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("<h1>not found</h1>");
  });

  const status = await checkCertificate({
    config: {
      checkUrl: `${baseUrl}/missing.pdf`,
      intervalMinutes: 15,
      downloadFilename: "certificate.pdf",
      smtp: {}
    }
  });

  assert.equal(status.state, "pending");
  assert.equal(status.isPublished, false);
  assert.equal(status.httpStatus, 404);
  assert.equal(status.downloadedPath, null);
});

test("downloads a published pdf and records email failure when smtp is missing", async () => {
  await listen((_req, res) => {
    res.writeHead(200, {
      "content-type": "application/pdf",
      "content-length": pdfBody.length
    });
    res.end(pdfBody);
  });

  const status = await checkCertificate({
    config: {
      checkUrl: `${baseUrl}/1234567.pdf`,
      intervalMinutes: 15,
      downloadFilename: "certificate.pdf",
      smtp: {}
    }
  });

  assert.equal(status.state, "published_email_failed");
  assert.equal(status.isPublished, true);
  assert.equal(status.notified, false);
  assert.match(status.emailError, /SMTP is not configured/);
  assert.ok(status.downloadedPath.endsWith("downloads/certificate.pdf"));

  const saved = await fs.readFile(status.downloadedPath);
  assert.equal(saved.toString(), pdfBody.toString());
});
