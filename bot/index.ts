import { Bot } from "grammy";
import { handleStart } from "./handlers/start";
import { handleTransactionText } from "./handlers/transaction";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is required");

export const bot = new Bot(token);

let initPromise: Promise<void> | null = null;
export function ensureInit(): Promise<void> {
  if (!initPromise) initPromise = bot.init();
  return initPromise;
}

bot.command("start", handleStart);
bot.on("message:text", handleTransactionText);
