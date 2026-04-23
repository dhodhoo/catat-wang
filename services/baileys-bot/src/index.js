import express from "express";
import pino from "pino";
import QRCode from "qrcode";
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import { config } from "./config.js";
import {
  createWebhookSignature,
  mapBaileysMessageToWahaEvent,
  normalizePhone,
  toCompatChatId,
  toWhatsAppJid
} from "./helpers.js";

const logger = pino({ level: config.logLevel });
const app = express();
app.use(express.json({ limit: "2mb" }));

let socket = null;
let isConnecting = false;
let currentQr = null;
let currentStatus = "STOPPED";
let currentMe = null;

async function postWebhook(payload) {
  const rawBody = JSON.stringify(payload);
  const signature = createWebhookSignature(rawBody, config.appWebhookSecret);

  const response = await fetch(config.appWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-waha-hmac": signature
    },
    body: rawBody
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Webhook request failed (${response.status}): ${text}`);
  }
}

async function emitSessionStatus() {
  try {
    await postWebhook({
      event: "session.status",
      payload: {
        name: config.sessionName,
        status: currentStatus,
        me: currentMe
      }
    });
  } catch (error) {
    logger.warn({ message: error?.message ?? String(error) }, "Failed to emit session.status webhook");
  }
}

function getSessionSnapshot() {
  return {
    configured: true,
    sessionName: config.sessionName,
    session: {
      name: config.sessionName,
      status: currentStatus,
      me: currentMe
    },
    qr: currentQr
  };
}

async function disconnectSession() {
  if (!socket) {
    currentStatus = "STOPPED";
    currentQr = null;
    currentMe = null;
    return;
  }

  try {
    await socket.logout();
  } catch (error) {
    logger.warn({ error }, "logout failed");
  }

  try {
    socket.end(undefined);
  } catch (error) {
    logger.warn({ error }, "socket.end failed");
  }

  socket = null;
  currentStatus = "STOPPED";
  currentQr = null;
  currentMe = null;

  await emitSessionStatus();
}

async function ensureSession() {
  if (socket || isConnecting) {
    return;
  }

  isConnecting = true;
  currentStatus = "STARTING";
  await emitSessionStatus();

  try {
    const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
    const { version } = await fetchLatestBaileysVersion();

    const waSocket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    waSocket.ev.on("creds.update", saveCreds);

    waSocket.ev.on("connection.update", async (update) => {
      if (update.qr) {
        currentQr = await QRCode.toDataURL(update.qr);
        currentStatus = "SCAN_QR_CODE";
        await emitSessionStatus();
      }

      if (update.connection === "connecting") {
        currentStatus = "STARTING";
        await emitSessionStatus();
      }

      if (update.connection === "open") {
        currentQr = null;
        currentStatus = "WORKING";
        currentMe = waSocket.user
          ? {
              id: toCompatChatId(waSocket.user.id),
              pushName: waSocket.user.name || ""
            }
          : null;
        await emitSessionStatus();
      }

      if (update.connection === "close") {
        const statusCode = new Boom(update.lastDisconnect?.error)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        socket = null;
        currentQr = null;
        currentMe = null;
        currentStatus = "STOPPED";
        await emitSessionStatus();

        if (!loggedOut) {
          logger.warn({ statusCode }, "Socket closed unexpectedly, reconnecting");
          await ensureSession();
        }
      }
    });

    waSocket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") {
        return;
      }

      for (const message of messages) {
        if (!message?.message || message?.key?.fromMe) {
          continue;
        }

        const payload = mapBaileysMessageToWahaEvent(message);
        if (!payload) {
          logger.debug({ key: message?.key }, "Skip unresolved LID message (waiting phone-number mapping)");
          continue;
        }
        try {
          await postWebhook(payload);
        } catch (error) {
          logger.error({ message: error?.message ?? String(error), payload }, "Failed to forward incoming message webhook");
        }
      }
    });

    socket = waSocket;
  } finally {
    isConnecting = false;
  }
}

function authenticate(req, res, next) {
  const apiKey = req.header("x-api-key") || "";
  if (!apiKey || apiKey !== config.botApiKey) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

app.get("/health", authenticate, (_req, res) => {
  res.json({
    status: "ok",
    provider: "baileys",
    session: {
      status: currentStatus,
      me: currentMe
    }
  });
});

app.get("/session", authenticate, (_req, res) => {
  res.json(getSessionSnapshot());
});

app.post("/session", authenticate, async (req, res) => {
  const action = req.body?.action || "ensure";

  if (action === "disconnect") {
    await disconnectSession();
    res.json(getSessionSnapshot());
    return;
  }

  await ensureSession();
  res.json(getSessionSnapshot());
});

app.post("/messages/send", authenticate, async (req, res) => {
  const to = req.body?.to;
  const text = req.body?.text;

  if (!to || !text) {
    res.status(400).json({ message: "Body requires { to, text }" });
    return;
  }

  if (!socket || currentStatus !== "WORKING") {
    res.status(409).json({ message: "Session belum WORKING" });
    return;
  }

  const jid = toWhatsAppJid(to);
  if (!jid) {
    res.status(400).json({ message: "Nomor tujuan tidak valid" });
    return;
  }

  const normalizedPhone = normalizePhone(to);
  const sent = await socket.sendMessage(jid, { text: String(text) });

  res.json({
    provider: "baileys",
    to: normalizedPhone,
    messages: [
      {
        id: sent?.key?.id || null,
        chatId: toCompatChatId(jid)
      }
    ]
  });
});

const server = app.listen(config.port, async () => {
  logger.info({ port: config.port, sessionName: config.sessionName }, "Baileys bot listening");
  await ensureSession();
});

process.on("SIGINT", async () => {
  await disconnectSession();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await disconnectSession();
  server.close(() => process.exit(0));
});
