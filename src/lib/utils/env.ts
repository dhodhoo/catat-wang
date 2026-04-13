import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_INSFORGE_URL: z.string().url(),
  INSFORGE_ANON_KEY: z.string().min(1),
  INSFORGE_SERVICE_KEY: z.string().min(1).optional(),
  WAHA_BASE_URL: z.string().url().optional(),
  WAHA_API_KEY: z.string().min(1).optional(),
  WAHA_SESSION_NAME: z.string().min(1).default("default"),
  WAHA_WEBHOOK_URL: z.string().url().optional(),
  WAHA_WEBHOOK_SECRET: z.string().min(1).optional(),
  WAHA_INTERNAL_ADMIN_EMAILS: z.string().default(""),
  RECEIPT_AI_MODEL: z.string().default("openai/gpt-4o-mini"),
  REMINDER_WEBHOOK_SECRET: z.string().min(1).optional()
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_INSFORGE_URL:
    process.env.NEXT_PUBLIC_INSFORGE_URL ?? "https://example.ap-southeast.insforge.app",
  INSFORGE_ANON_KEY: process.env.INSFORGE_ANON_KEY ?? "dev-anon-key",
  INSFORGE_SERVICE_KEY: process.env.INSFORGE_SERVICE_KEY,
  WAHA_BASE_URL: process.env.WAHA_BASE_URL,
  WAHA_API_KEY: process.env.WAHA_API_KEY,
  WAHA_SESSION_NAME: process.env.WAHA_SESSION_NAME,
  WAHA_WEBHOOK_URL: process.env.WAHA_WEBHOOK_URL,
  WAHA_WEBHOOK_SECRET: process.env.WAHA_WEBHOOK_SECRET,
  WAHA_INTERNAL_ADMIN_EMAILS: process.env.WAHA_INTERNAL_ADMIN_EMAILS,
  RECEIPT_AI_MODEL: process.env.RECEIPT_AI_MODEL,
  REMINDER_WEBHOOK_SECRET: process.env.REMINDER_WEBHOOK_SECRET
});
