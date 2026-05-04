# MCM/ICM Certificate Monitor

Local web monitor for checking whether an MCM/ICM certificate PDF has been published. The team number is read from `.env` so it is not committed to GitHub.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and fill `MCM_TEAM_NUMBER` plus your SMTP settings. Use an email app password / authorization code, not your normal login password.

## Run

```bash
npm run dev
```

打开终端显示的本地地址，例如 `http://localhost:3000`。

## Manual Check

```bash
npm run check
```

这个命令会立刻检查一次，并打印状态。适合测试链接和 SMTP 配置。

## Status Files

- `data/status.json`：最近一次检查结果和通知状态。
- `downloads/certificate.pdf`：检测到发布后保存的证书，除非你在 `.env` 中自定义 `DOWNLOAD_FILENAME`。
