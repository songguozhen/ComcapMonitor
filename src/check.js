import { getConfig } from "./config.js";
import { checkCertificate } from "./monitor.js";

const status = await checkCertificate({
  config: getConfig(),
  includeNextCheck: false
});

console.log(JSON.stringify(status, null, 2));

if (status.state === "error") {
  process.exitCode = 1;
}
