# ComcapMonitor

一个本地运行的美赛 MCM/ICM 证书发布监测网页程序。

程序会定时访问 COMAP 证书 PDF 地址。如果证书还没发布，网页会显示当前 HTTP 状态；如果检测到真实 PDF，程序会自动下载证书，并通过 SMTP 邮件提醒。

## 功能

- 每 15 分钟自动检查一次证书是否发布。
- 提供本地网页仪表盘，显示最近检查时间、下次检查时间、HTTP 状态码、内容类型和错误信息。
- 支持手动立即检查。
- 检测到 PDF 后自动保存到 `downloads/certificate.pdf`。
- 支持 SMTP 邮件提醒，并可把 PDF 作为附件发送。
- 队伍号只放在本地 `.env`，不会提交到 GitHub。

## 隐私

请不要把真实队伍号写进 README、源码或 `.env.example`。

本项目通过下面两个环境变量拼接证书地址：

```bash
MCM_TEAM_NUMBER=你的队伍号
CERT_BASE_URL=https://www.comap-math.org/mcm/2026Certs
```

真实队伍号应该只存在于本地 `.env` 文件中。`.env` 已经被 `.gitignore` 忽略。

## 安装

```bash
npm install
cp .env.example .env
```

然后编辑 `.env`，填入：

- `MCM_TEAM_NUMBER`：你的队伍号
- `SMTP_HOST`：SMTP 服务器地址
- `SMTP_PORT`：SMTP 端口
- `SMTP_SECURE`：是否使用 SSL，通常 `465` 端口填 `true`
- `SMTP_USER`：发件邮箱账号
- `SMTP_PASS`：SMTP 授权码或 app password
- `MAIL_FROM`：发件人
- `MAIL_TO`：收件人

QQ 邮箱、163 邮箱、Gmail 或学校邮箱通常需要使用“授权码 / app password”，不要填写网页登录密码。

## 启动

```bash
npm run dev
```

启动后打开终端显示的地址，通常是：

```text
http://localhost:3000
```

## 手动检查

```bash
npm run check
```

这个命令会立刻检查一次，并在终端输出当前状态，适合调试网络、链接和 SMTP 配置。

## 文件说明

- `src/monitor.js`：证书检查、PDF 判定、下载和邮件提醒逻辑。
- `src/server.js`：本地网页服务和 API。
- `public/`：网页仪表盘。
- `data/status.json`：运行时状态文件，不会提交。
- `downloads/`：证书下载目录，不会提交。

## 上传前检查

推送 GitHub 前建议运行：

```bash
git grep -n "你的真实队伍号"
```

如果没有输出，就说明当前提交内容里没有真实队伍号。
