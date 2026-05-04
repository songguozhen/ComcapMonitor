import { checkCertificate } from "./monitor.js";
import { patchStatus } from "./statusStore.js";

export function startScheduler(config) {
  let timer = null;
  let isChecking = false;

  const run = async () => {
    if (isChecking) return;
    isChecking = true;
    try {
      await checkCertificate({ config, includeNextCheck: true });
    } finally {
      isChecking = false;
    }
  };

  const intervalMs = config.intervalMinutes * 60 * 1000;
  timer = setInterval(run, intervalMs);
  run();

  return {
    async checkNow() {
      await run();
    },
    async stop() {
      if (timer) clearInterval(timer);
      timer = null;
      await patchStatus({ nextCheckAt: null });
    }
  };
}
