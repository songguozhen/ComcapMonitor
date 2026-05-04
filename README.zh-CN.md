# 美赛证书监测网页程序

这是一个本地运行的 MCM/ICM 证书监测工具。程序会每 15 分钟访问一次证书地址；一旦检测到真实 PDF，就把证书下载到本地，并通过 SMTP 邮件提醒。

## 隐私说明

队伍号不会写在代码、README 或 `.env.example` 里。真实队伍号只放在本地 `.env` 文件中，而 `.env` 已被 `.gitignore` 忽略，不会上传到 GitHub。

## 安装

```bash
npm install
cp .env.example .env
```

然后编辑 `.env`：

```bash
MCM_TEAM_NUMBER=你的队伍号
CERT_BASE_URL=https://www.comap-math.org/mcm/2026Certs
CHECK_INTERVAL_MINUTES=15
DOWNLOAD_FILENAME=certificate.pdf
```

继续填写 SMTP 配置。QQ 邮箱、163 邮箱、Gmail 或学校邮箱通常需要使用“授权码 / app password”，不要填写网页登录密码。

## 启动网页监测

```bash
npm run dev
```

打开终端里显示的本地地址，例如：

```text
http://localhost:3000
```

## 手动检查一次

```bash
npm run check
```

这个命令会立刻访问一次证书地址，并输出当前状态。适合确认链接、网络和 SMTP 配置是否正常。

## 状态与下载文件

- `data/status.json`：最近一次检查状态、HTTP 状态码、通知状态和错误信息。
- `downloads/certificate.pdf`：检测到发布后保存的证书文件，文件名可通过 `DOWNLOAD_FILENAME` 修改。

## GitHub 上传前检查

上传前可以运行：

```bash
rg "你的队伍号|MCM_TEAM_NUMBER=" -g '!node_modules/**' -g '!.env'
```

确认真实队伍号只存在于 `.env`。
