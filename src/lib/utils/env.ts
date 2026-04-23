import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_INSFORGE_URL: z.string().url(),
  INSFORGE_ANON_KEY: z.string().min(1),
  INSFORGE_SERVICE_KEY: z.string().min(1).optional(),
  WHATSAPP_PROVIDER: z.enum(["waha", "baileys"]).default("waha"),
  WAHA_BASE_URL: z.string().url().optional(),
  WAHA_API_KEY: z.string().min(1).optional(),
  WAHA_SESSION_NAME: z.string().min(1).default("default"),
  WAHA_WEBHOOK_URL: z.string().url().optional(),
  WAHA_WEBHOOK_SECRET: z.string().min(1).optional(),
  WAHA_WEBHOOK_SECRET_PREVIOUS: z.string().min(1).optional(),
  BAILEYS_BOT_BASE_URL: z.string().url().optional(),
  BAILEYS_BOT_API_KEY: z.string().min(1).optional(),
  WAHA_INTERNAL_ADMIN_EMAILS: z.string().default(""),
  REMINDER_WEBHOOK_SECRET: z.string().min(1).optional()
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? (isProduction ? undefined : "http://localhost:3000"),
  NEXT_PUBLIC_INSFORGE_URL:
    process.env.NEXT_PUBLIC_INSFORGE_URL ??
    (isProduction ? undefined : "https://example.ap-southeast.insforge.app"),
  INSFORGE_ANON_KEY: process.env.INSFORGE_ANON_KEY ?? (isProduction ? undefined : "dev-anon-key"),
  INSFORGE_SERVICE_KEY: process.env.INSFORGE_SERVICE_KEY,
  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
  WAHA_BASE_URL: process.env.WAHA_BASE_URL,
  WAHA_API_KEY: process.env.WAHA_API_KEY,
  WAHA_SESSION_NAME: process.env.WAHA_SESSION_NAME,
  WAHA_WEBHOOK_URL: process.env.WAHA_WEBHOOK_URL,
  WAHA_WEBHOOK_SECRET: process.env.WAHA_WEBHOOK_SECRET,
  WAHA_WEBHOOK_SECRET_PREVIOUS: process.env.WAHA_WEBHOOK_SECRET_PREVIOUS,
  BAILEYS_BOT_BASE_URL: process.env.BAILEYS_BOT_BASE_URL,
  BAILEYS_BOT_API_KEY: process.env.BAILEYS_BOT_API_KEY,
  WAHA_INTERNAL_ADMIN_EMAILS: process.env.WAHA_INTERNAL_ADMIN_EMAILS,
  REMINDER_WEBHOOK_SECRET: process.env.REMINDER_WEBHOOK_SECRET
});
