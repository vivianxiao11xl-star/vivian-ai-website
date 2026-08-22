# 第四期一号位 AI 工作坊网站框架

- 线上路径：`/workshop-04/`
- 当前状态：Day 1 上午与下午学习笔记已写入；课堂网站作品展已收录 13 份在线作品；晚间 AI 员工发布会投票、实时结果与投屏二维码已于 2026-08-22 上线。
- 后续待填：Day 1 晚上笔记、Day 2、现场照片、证书与挑战赛最终结果。
- 上线正式内容前建议：确认密码并用 Staticrypt 加密。

## 页面清单

- `index.html` 总入口
- `day1-morning.html` / `day1-afternoon.html` / `day1-evening.html`
- `day2-morning.html` / `day2-afternoon.html`
- `galaxy.html` 课堂网站作品展 / 学员群星谱入口
- `assets/learner-sites/` 课堂作品稳定预览图
- `toolkit.html` 武器库（复用 0625 版设计）
- `moments/index.html` 照片墙
- `vote.html` 手机投票 / `result.html` 实时亮票 / `vote-qr.html` 投屏扫码 / `qrcode-vote.png` 二维码 / `champion.html` 冠军页
- `cert-preview.html` 证书

## 当前更新

- `day1-morning.html`：已替换为第四期真实上午学习笔记的公开安全版。
- `day1-afternoon.html`：已写入 Context 管理、3C、Skill V0、文件系统与晚间分组前的公开学习笔记。
- `galaxy.html`：已由占位页升级为 13 份课堂网站作品的综合展示页，含分类筛选、原站入口、大屏放映和现场二维码。
- `index.html`：已更新活动日期、人数、Day 1 上午笔记入口、作品展预览和本期连接机会。
- `vote.html`：四组匿名单选，每台设备限 1 票，先选本组并自动排除本组。
- `result.html`：每 1.5 秒刷新，默认隐藏票数，由主持人点击“亮票”后显示结果。
- `vote-qr.html`：投影用二维码页，指向 `https://vivianai.cn/workshop-04/vote.html`。
