import crypto from "node:crypto";
import { env } from "@/lib/utils/env";

interface WahaSessionConfig {
  name: string;
  start?: boolean;
  config?: {
    proxy?: unknown;
    webhooks?: Array<{
      url: string;
      events: string[];
      hmac?: {
        key: string;
      };
      retries?: {
        attempts: number;
        delaySeconds: number;
      };
    }>;
  };
}

interface WahaSessionResponse {
  name: string;
  status: string;
  me?: {
    id?: string;
    pushName?: string;
  } | null;
}

function getWahaHeaders() {
  if (!env.WAHA_BASE_URL || !env.WAHA_API_KEY) {
    throw new Error("WAHA belum dikonfigurasi. Isi WAHA_BASE_URL dan WAHA_API_KEY.");
  }

  return {
    "Content-Type": "application/json",
    "X-Api-Key": env.WAHA_API_KEY
  };
}

function buildWahaUrl(path: string) {
  if (!env.WAHA_BASE_URL) {
    throw new Error("WAHA_BASE_URL belum dikonfigurasi.");
  }

  return new URL(path, env.WAHA_BASE_URL).toString();
}

export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits.startsWith("62") ? `+${digits}` : `+${digits}`;
}

export function toWahaChatId(phone: string) {
  return `${normalizePhone(phone).replace(/^\+/, "")}@c.us`;
}

export function fromWahaChatId(chatId: string) {
  return normalizePhone(chatId.replace(/@c\.us$/i, ""));
}

export function verifyWhatsAppSignature(rawBody: string, signature: string | null) {
  if (!env.WAHA_WEBHOOK_SECRET) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", env.WAHA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function sendWhatsAppTextMessage(to: string, body: string) {
  const response = await fetch(buildWahaUrl("/api/sendText"), {
    method: "POST",
    headers: getWahaHeaders(),
    body: JSON.stringify({
      session: env.WAHA_SESSION_NAME,
      chatId: to.includes("@") ? to : toWahaChatId(to),
      text: body
    })
  });

  if (!response.ok) {
    throw new Error(`Gagal mengirim pesan WAHA (${response.status}).`);
  }

  return response.json();
}

export async function downloadWhatsAppMedia(mediaUrl: string) {
  const response = await fetch(mediaUrl.startsWith("http") ? mediaUrl : buildWahaUrl(mediaUrl), {
    headers: {
      "X-Api-Key": env.WAHA_API_KEY ?? ""
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunduh media WAHA (${response.status}).`);
  }

  return response.blob();
}

export async function getWhatsAppMediaDownloadUrl(mediaUrlOrPath: string) {
  if (!mediaUrlOrPath.startsWith("http")) {
    return buildWahaUrl(mediaUrlOrPath);
  }

  if (!env.WAHA_BASE_URL) {
    return mediaUrlOrPath;
  }

  try {
    const incomingUrl = new URL(mediaUrlOrPath);
    const wahaUrl = new URL(env.WAHA_BASE_URL);

    // WAHA local sometimes emits file URLs using the app host instead of the WAHA host.
    if (incomingUrl.pathname.startsWith("/api/files/") && incomingUrl.origin !== wahaUrl.origin) {
      incomingUrl.protocol = wahaUrl.protocol;
      incomingUrl.host = wahaUrl.host;
      return incomingUrl.toString();
    }
  } catch {
    return mediaUrlOrPath;
  }

  return mediaUrlOrPath;
}

export async function getWahaSession(name = env.WAHA_SESSION_NAME) {
  const response = await fetch(buildWahaUrl(`/api/sessions/${name}`), {
    headers: getWahaHeaders(),
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Gagal mengambil session WAHA (${response.status}).`);
  }

  return (await response.json()) as WahaSessionResponse;
}

export async function createOrUpdateWahaSession(config: WahaSessionConfig) {
  const existing = await getWahaSession(config.name);
  if (!existing) {
    const createResponse = await fetch(buildWahaUrl("/api/sessions"), {
      method: "POST",
      headers: getWahaHeaders(),
      body: JSON.stringify(config)
    });

    if (!createResponse.ok) {
      throw new Error(`Gagal membuat session WAHA (${createResponse.status}).`);
    }

    return (await createResponse.json()) as WahaSessionResponse;
  }

  const updateResponse = await fetch(buildWahaUrl(`/api/sessions/${config.name}`), {
    method: "PUT",
    headers: getWahaHeaders(),
    body: JSON.stringify(config)
  });

  if (!updateResponse.ok) {
    throw new Error(`Gagal mengubah session WAHA (${updateResponse.status}).`);
  }

  return (await updateResponse.json()) as WahaSessionResponse;
}

export async function startWahaSession(name = env.WAHA_SESSION_NAME) {
  const response = await fetch(buildWahaUrl(`/api/sessions/${name}/start`), {
    method: "POST",
    headers: getWahaHeaders()
  });

  if (response.status === 422) {
    return { status: "already_started" };
  }

  if (!response.ok) {
    throw new Error(`Gagal memulai session WAHA (${response.status}).`);
  }

  return response.json();
}

export async function stopWahaSession(name = env.WAHA_SESSION_NAME) {
  const response = await fetch(buildWahaUrl(`/api/sessions/${name}/stop`), {
    method: "POST",
    headers: getWahaHeaders()
  });

  if (!response.ok) {
    throw new Error(`Gagal menghentikan session WAHA (${response.status}).`);
  }

  return response.json();
}

export async function getWahaQrCode(name = env.WAHA_SESSION_NAME) {
  const response = await fetch(buildWahaUrl(`/api/${name}/auth/qr`), {
    headers: getWahaHeaders(),
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Gagal mengambil QR WAHA (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
