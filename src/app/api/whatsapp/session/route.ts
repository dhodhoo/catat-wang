import { requireCurrentUserApi } from "@/lib/insforge/auth";
import {
  createOrUpdateWahaSession,
  getWahaQrCode,
  getWahaSession,
  startWahaSession,
  stopWahaSession
} from "@/lib/whatsapp/client";
import { WahaAdminAccessError, requireWahaInternalAdminEmail } from "@/lib/whatsapp/admin";
import { env } from "@/lib/utils/env";
import { fail, ok } from "@/lib/utils/http";

const SESSION_POLL_ATTEMPTS = 6;
const SESSION_POLL_DELAY_MS = 1500;

function assertWebhookSecretConfigured() {
  if (process.env.NODE_ENV === "production" && !env.WAHA_WEBHOOK_SECRET) {
    throw new Error("WAHA_WEBHOOK_SECRET wajib diisi pada environment production.");
  }
}

function buildWebhookUrl() {
  const baseUrl = env.WAHA_WEBHOOK_URL ?? env.NEXT_PUBLIC_APP_URL;
  return `${baseUrl.replace(/\/$/, "")}/api/whatsapp/webhook`;
}

function buildSessionConfig() {
  return {
    name: env.WAHA_SESSION_NAME,
    start: false,
    config: {
      webhooks: [
        {
          url: buildWebhookUrl(),
          events: ["message", "session.status"],
          ...(env.WAHA_WEBHOOK_SECRET
            ? {
                hmac: {
                  key: env.WAHA_WEBHOOK_SECRET
                }
              }
            : {}),
          retries: {
            attempts: 3,
            delaySeconds: 2
          }
        }
      ]
    }
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readSessionSnapshot() {
  const session = await getWahaSession();
  const qr = session?.status === "SCAN_QR_CODE" ? await getWahaQrCode() : null;

  return {
    session,
    qr
  };
}

async function waitForSessionSnapshot() {
  let snapshot = await readSessionSnapshot();

  for (let attempt = 0; attempt < SESSION_POLL_ATTEMPTS; attempt += 1) {
    const status = snapshot.session?.status;
    const needsQrWait = status === "STARTING" || (status === "SCAN_QR_CODE" && !snapshot.qr);

    if (!needsQrWait) {
      return snapshot;
    }

    await sleep(SESSION_POLL_DELAY_MS);
    snapshot = await readSessionSnapshot();
  }

  return snapshot;
}

export async function GET() {
  try {
    assertWebhookSecretConfigured();
    const user = await requireCurrentUserApi();
    requireWahaInternalAdminEmail(user.email);
    const { session, qr } = await waitForSessionSnapshot();

    return ok({
      configured: Boolean(env.WAHA_BASE_URL && env.WAHA_API_KEY),
      sessionName: env.WAHA_SESSION_NAME,
      webhookUrl: buildWebhookUrl(),
      session: session
        ? {
            name: session.name,
            status: session.status,
            me: session.me ?? null
          }
        : null,
      qr
    });
  } catch (error) {
    if (error instanceof WahaAdminAccessError) {
      return fail(error.message, 403, "forbidden");
    }
    return fail(error instanceof Error ? error.message : "Gagal mengambil status WAHA.");
  }
}

export async function POST(request: Request) {
  try {
    assertWebhookSecretConfigured();
    const user = await requireCurrentUserApi();
    requireWahaInternalAdminEmail(user.email);
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    const action = body.action ?? "ensure";

    if (action === "disconnect") {
      await stopWahaSession();
      return ok({ status: "ok" });
    }

    await createOrUpdateWahaSession(buildSessionConfig());
    await startWahaSession();

    const { session, qr } = await waitForSessionSnapshot();

    return ok({
      status: "ok",
      sessionName: env.WAHA_SESSION_NAME,
      session,
      qr
    });
  } catch (error) {
    if (error instanceof WahaAdminAccessError) {
      return fail(error.message, 403, "forbidden");
    }
    return fail(error instanceof Error ? error.message : "Gagal menyiapkan session WAHA.");
  }
}
