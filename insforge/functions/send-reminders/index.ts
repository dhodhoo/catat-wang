import { createClient } from "npm:@insforge/sdk";

const client = createClient({
  baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
  anonKey: Deno.env.get("API_KEY") ?? Deno.env.get("ANON_KEY"),
  isServerMode: true
});

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

function getLocalReminderContext(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";

  return {
    hourMinute: `${hour}:${minute}`,
    weekday: weekdayMap[weekday] ?? 0
  };
}

async function sendWhatsAppMessage(to: string, body: string) {
  const provider = Deno.env.get("WHATSAPP_PROVIDER") ?? "waha";
  const normalizedPhone = `+${String(to).replace(/[^\d]/g, "").replace(/^0/, "62")}`;

  if (provider === "baileys") {
    const botBaseUrl = Deno.env.get("BAILEYS_BOT_BASE_URL");
    const botApiKey = Deno.env.get("BAILEYS_BOT_API_KEY");

    const response = await fetch(new URL("/messages/send", botBaseUrl).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": botApiKey ?? ""
      },
      body: JSON.stringify({
        to: normalizedPhone,
        text: body
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send Baileys reminder (${response.status})`);
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return {};
    }
    try {
      return JSON.parse(responseText);
    } catch {
      return { raw: responseText };
    }
  }

  const wahaBaseUrl = Deno.env.get("WAHA_BASE_URL");
  const wahaApiKey = Deno.env.get("WAHA_API_KEY");
  const session = Deno.env.get("WAHA_SESSION_NAME") ?? "default";
  const chatId = `${normalizedPhone.replace(/^\+/, "")}@c.us`;

  const response = await fetch(new URL("/api/sendText", wahaBaseUrl).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": wahaApiKey ?? ""
    },
    body: JSON.stringify({
      session,
      chatId,
      text: body
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send WAHA reminder (${response.status})`);
  }

  const responseText = await response.text();

  if (!responseText.trim()) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return { raw: responseText };
  }
}

export default async function handler(req: Request) {
  const serviceKey = Deno.env.get("INSFORGE_SERVICE_KEY");
  const reminderWebhookSecret = Deno.env.get("REMINDER_WEBHOOK_SECRET");
  const authHeader = req.headers.get("Authorization");
  const reminderSecretHeader = req.headers.get("X-Reminder-Webhook-Secret");

  const hasAnyCredential = Boolean(serviceKey || reminderWebhookSecret);
  const authenticatedByServiceKey = Boolean(serviceKey && authHeader === `Bearer ${serviceKey}`);
  const authenticatedByWebhookSecret = Boolean(
    reminderWebhookSecret && reminderSecretHeader === reminderWebhookSecret
  );

  if (hasAnyCredential && !authenticatedByServiceKey && !authenticatedByWebhookSecret) {
    return new Response(JSON.stringify({ status: "unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  const provider = Deno.env.get("WHATSAPP_PROVIDER") ?? "waha";
  const hasWahaConfig = Boolean(Deno.env.get("WAHA_BASE_URL") && Deno.env.get("WAHA_API_KEY"));
  const hasBaileysConfig = Boolean(Deno.env.get("BAILEYS_BOT_BASE_URL") && Deno.env.get("BAILEYS_BOT_API_KEY"));
  const providerConfigured = provider === "baileys" ? hasBaileysConfig : hasWahaConfig;

  if (!providerConfigured) {
    return new Response(JSON.stringify({ status: "skipped", reason: "WhatsApp provider is not configured" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  const now = new Date();

  const { data, error } = await client.database
    .from("profiles")
    .select("id, whatsapp_phone_e164, reminder_frequency, reminder_time, reminder_weekday, timezone")
    .eq("reminder_enabled", true)
    .not("whatsapp_phone_e164", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const profile of data ?? []) {
    const timezone = profile.timezone || "Asia/Jakarta";
    const { hourMinute, weekday } = getLocalReminderContext(timezone);
    const isDaily = profile.reminder_frequency === "daily" && profile.reminder_time?.slice(0, 5) === hourMinute;
    const isWeekly =
      profile.reminder_frequency === "weekly" &&
      profile.reminder_time?.slice(0, 5) === hourMinute &&
      profile.reminder_weekday === weekday;

    if (!isDaily && !isWeekly) {
      continue;
    }

    const messageText =
      profile.reminder_frequency === "weekly"
        ? "Jangan lupa catat transaksi minggu ini. Balas langsung di sini untuk mencatat."
        : "Sudah ada pengeluaran hari ini? Balas langsung di sini untuk mencatat.";

    try {
      const sendResult = await sendWhatsAppMessage(profile.whatsapp_phone_e164, messageText);
      await client.database.from("reminder_dispatch_logs").insert([
        {
          user_id: profile.id,
          schedule_type: profile.reminder_frequency,
          scheduled_for: now.toISOString(),
          sent_at: new Date().toISOString(),
          message_text: messageText,
          whatsapp_message_id: sendResult?.messages?.[0]?.id ?? null,
          status: "sent"
        }
      ]);
    } catch (sendError) {
      await client.database.from("reminder_dispatch_logs").insert([
        {
          user_id: profile.id,
          schedule_type: profile.reminder_frequency,
          scheduled_for: now.toISOString(),
          message_text: messageText,
          status: "failed",
          error_message: sendError instanceof Error ? sendError.message : "Failed"
        }
      ]);
    }
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
