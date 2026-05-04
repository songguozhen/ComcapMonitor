import fs from "node:fs/promises";
import { dataDir, statusPath } from "./paths.js";

export const initialStatus = {
  state: "idle",
  message: "Monitor has not checked yet.",
  checkUrl: "",
  lastCheckedAt: null,
  nextCheckAt: null,
  httpStatus: null,
  contentType: null,
  contentLength: null,
  isPublished: false,
  notified: false,
  downloadedPath: null,
  lastError: null,
  emailError: null,
  updatedAt: null
};

export async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function readStatus() {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(statusPath, "utf8");
    return { ...initialStatus, ...JSON.parse(raw) };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...initialStatus };
    }
    throw error;
  }
}

export async function writeStatus(status) {
  await ensureDataDir();
  const nextStatus = {
    ...initialStatus,
    ...status,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(statusPath, `${JSON.stringify(nextStatus, null, 2)}\n`);
  return nextStatus;
}

export async function patchStatus(patch) {
  const current = await readStatus();
  return writeStatus({ ...current, ...patch });
}
