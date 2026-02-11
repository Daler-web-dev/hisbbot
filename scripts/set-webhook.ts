/**
 * One-time: register Telegram webhook URL.
 * Run: npx tsx scripts/set-webhook.ts
 * Requires: BOT_TOKEN, NEXT_PUBLIC_WEBHOOK_BASE_URL in .env
 */
import "dotenv/config";

const token = process.env.BOT_TOKEN;
const base = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL;

if (!token || !base) {
  console.error("Set BOT_TOKEN and NEXT_PUBLIC_WEBHOOK_BASE_URL in .env");
  process.exit(1);
}

const url = `${base.replace(/\/$/, "")}/api/webhook/telegram`;
const setWebhookUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(url)}`;

(async () => {
  const res = await fetch(setWebhookUrl);
  const data = (await res.json()) as { ok: boolean; description?: string };
  if (data.ok) {
    console.log("Webhook set:", url);
  } else {
    console.error("Failed:", data.description);
    process.exit(1);
  }
})();
