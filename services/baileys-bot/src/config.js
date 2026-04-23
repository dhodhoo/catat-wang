import fs from "node:fs";
import path from "node:path";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const authDir = process.env.BAILEYS_AUTH_DIR || path.resolve(process.cwd(), ".baileys-auth");
fs.mkdirSync(authDir, { recursive: true });

export const config = {
  port: Number(process.env.PORT || 3101),
  sessionName: process.env.SESSION_NAME || "default",
  botApiKey: requireEnv("BOT_API_KEY"),
  appWebhookUrl: requireEnv("APP_WEBHOOK_URL"),
  appWebhookSecret: requireEnv("APP_WEBHOOK_SECRET"),
  authDir,
  logLevel: process.env.LOG_LEVEL || "info"
};
