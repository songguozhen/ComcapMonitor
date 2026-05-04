import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, "..");
export const dataDir = path.join(rootDir, "data");
export const downloadsDir = path.join(rootDir, "downloads");
export const publicDir = path.join(rootDir, "public");
export const statusPath = path.join(dataDir, "status.json");
