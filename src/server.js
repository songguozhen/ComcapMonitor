import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { getConfig } from "./config.js";
import { publicDir } from "./paths.js";
import { readStatus } from "./statusStore.js";
import { startScheduler } from "./scheduler.js";

const app = express();
const config = getConfig();
const scheduler = startScheduler(config);

app.use(express.json());
app.use(express.static(publicDir));

app.get("/api/status", async (_req, res) => {
  res.json(await readStatus());
});

app.post("/api/check", async (_req, res) => {
  await scheduler.checkNow();
  res.json(await readStatus());
});

app.get("/certificate", async (_req, res) => {
  const status = await readStatus();
  if (!status.downloadedPath) {
    res.status(404).send("Certificate has not been downloaded yet.");
    return;
  }

  try {
    await fs.access(status.downloadedPath);
    res.download(status.downloadedPath, path.basename(status.downloadedPath));
  } catch {
    res.status(404).send("Downloaded certificate file is missing.");
  }
});

function listenWithFallback(port, attempts = 2) {
  const server = app.listen(port, () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    console.log(`MCM certificate monitor is running at http://localhost:${actualPort}`);
    console.log(`Checking ${config.checkUrl} every ${config.intervalMinutes} minutes.`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts > 0) {
      listenWithFallback(port + 1, attempts - 1);
      return;
    }
    throw error;
  });

  return server;
}

const server = listenWithFallback(config.port);

async function shutdown() {
  await scheduler.stop();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
