import { createClient } from "npm:@insforge/sdk";

const client = createClient({
  baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
  anonKey: Deno.env.get("API_KEY") ?? Deno.env.get("ANON_KEY"),
  isServerMode: true
});

async function sendWhatsAppMessage(to: string, body: string) {
  const wahaBaseUrl = Deno.env.get("WAHA_BASE_URL");
  const wahaApiKey = Deno.env.get("WAHA_API_KEY");
  const session = Deno.env.get("WAHA_SESSION_NAME") ?? "default";
  const chatId = `${String(to).replace(/^\+/, "")}@c.us`;

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

  return response.json();
}

export default async function handler() {
  if (!Deno.env.get("WAHA_BASE_URL") || !Deno.env.get("WAHA_API_KEY")) {
    return new Response(JSON.stringify({ status: "skipped", reason: "WAHA is not configured" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  const now = new Date();
  const hourMinute = now.toISOString().slice(11, 16);
  const weekday = now.getUTCDay();

  const { data, error } = await client.database
    .from("profiles")
    .select("id, whatsapp_phone_e164, reminder_frequency, reminder_time, reminder_weekday")
    .eq("reminder_enabled", true)
    .not("whatsapp_phone_e164", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const profile of data ?? []) {
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
