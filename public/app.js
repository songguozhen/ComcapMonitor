const stateText = document.querySelector("#stateText");
const stateBadge = document.querySelector("#stateBadge");
const lastCheckedAt = document.querySelector("#lastCheckedAt");
const nextCheckAt = document.querySelector("#nextCheckAt");
const httpStatus = document.querySelector("#httpStatus");
const contentType = document.querySelector("#contentType");
const checkUrl = document.querySelector("#checkUrl");
const downloadedPath = document.querySelector("#downloadedPath");
const notified = document.querySelector("#notified");
const errorPanel = document.querySelector("#errorPanel");
const errorText = document.querySelector("#errorText");
const checkNow = document.querySelector("#checkNow");
const downloadLink = document.querySelector("#downloadLink");

const stateLabels = {
  idle: ["等待检查", "badge-idle"],
  pending: ["未发布", "badge-pending"],
  published: ["已发布", "badge-success"],
  published_email_failed: ["已发布", "badge-danger"],
  error: ["检查失败", "badge-danger"]
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));
}

function setBadge(state) {
  const [label, className] = stateLabels[state] || stateLabels.idle;
  stateBadge.textContent = label;
  stateBadge.className = `badge ${className}`;
}

function render(status) {
  stateText.textContent = status.message || "读取中";
  setBadge(status.state);
  lastCheckedAt.textContent = formatDate(status.lastCheckedAt);
  nextCheckAt.textContent = formatDate(status.nextCheckAt);
  httpStatus.textContent = status.httpStatus ?? "-";
  contentType.textContent = status.contentType || "-";

  if (status.checkUrl) {
    checkUrl.textContent = status.checkUrl;
    checkUrl.href = status.checkUrl;
  } else {
    checkUrl.textContent = "-";
    checkUrl.removeAttribute("href");
  }

  downloadedPath.textContent = status.downloadedPath || "-";
  notified.textContent = status.notified ? "已发送" : "未发送";
  downloadLink.classList.toggle("hidden", !status.downloadedPath);

  const error = status.emailError || status.lastError;
  errorPanel.classList.toggle("hidden", !error);
  errorText.textContent = error || "";
}

async function loadStatus() {
  const response = await fetch("/api/status");
  render(await response.json());
}

checkNow.addEventListener("click", async () => {
  checkNow.disabled = true;
  checkNow.textContent = "检查中...";
  try {
    const response = await fetch("/api/check", { method: "POST" });
    render(await response.json());
  } finally {
    checkNow.disabled = false;
    checkNow.innerHTML = '<span aria-hidden="true">↻</span> 立即检查';
  }
});

await loadStatus();
setInterval(loadStatus, 30_000);
