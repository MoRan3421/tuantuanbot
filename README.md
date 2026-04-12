# 团团 TuanTuan Bot + Dashboard

这个仓库包含：

- `bot/`: Discord 机器人（`discord.js`）+ 内建 HTTP API（Stripe 付费开通、Webhook、网页端兑换码）
- `web/`: React (JSX/JS) 控制台网页（可用 Electron 打包成桌面 App）

## 开发运行

1. 根目录配置 `.env`（机器人 Token、Firebase Admin、可选 Stripe）。
2. 网页端可选配置 `web/.env`（参考 `web/.env.example`）。

### 启动 Bot (含 API)

```powershell
cd C:\tuantuanbot\bot
npm install
node index.js
```

默认会在 `PORT`（`.env` 里，默认 `8080`）启动：

- `GET /` / `GET /api/health`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- `POST /api/premium/redeem`

### 启动 Dashboard

```powershell
cd C:\tuantuanbot\web
npm install
npm run dev
```

如果要打包桌面 App：

```powershell
cd C:\tuantuanbot\web
npm run electron:dev
```

## 付费 (Stripe)

在 `.env` 里填好：

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_LIFETIME`
- `DASHBOARD_URL`（Stripe 成功/取消回跳用）

Webhook URL 示例：

- `https://你的机器人域名/api/stripe/webhook`

## 高级(收费)指令示例

- `/embed`（已标记为 `premiumOnly`）
- `/ai-story`（已标记为 `premiumOnly`）

