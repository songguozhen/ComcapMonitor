# About ComcapMonitor

ComcapMonitor 是一个为 MCM/ICM 美赛队伍准备的本地证书发布监测工具。

它解决的问题很简单：成绩和证书发布前，证书链接通常不会返回 PDF；发布后，同一个链接会变成可下载的证书文件。ComcapMonitor 会在本地定时检查这个链接，一旦发现证书已经可用，就自动下载 PDF，并通过邮件通知用户。

项目设计重点是隐私和易用：

- 队伍号只保存在本地 `.env` 文件中，不进入 GitHub 仓库。
- 网页仪表盘只在本机运行，适合长期开着等待结果。
- 邮箱密码使用 SMTP 授权码，不写入源码。
- 检查逻辑会同时判断 HTTP 状态、内容类型和 PDF 文件头，减少误判。

推荐 GitHub 仓库 About 描述：

```text
本地运行的美赛 MCM/ICM 证书发布监测网页程序：定时检查证书 PDF，发布后自动下载并发送邮件提醒。
```

推荐 Topics：

```text
mcm, icm, comap, certificate-monitor, nodejs, express, smtp
```
