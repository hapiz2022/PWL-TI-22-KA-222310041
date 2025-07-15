require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const WebSocket = require("ws");
const { computeCheck } = require("telegram/Password");
const { Anthropic } = require("@anthropic-ai/sdk");

const apiId = "";
const apiHash = "";
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

let session = new StringSession("");
let client = null;
let phoneCodeHash = "";
let cachedPhone = "";

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 3002 });
wss.on("connection", () => console.log("🔌 WS connected"));

function broadcastMessage(msg, fromId, senderName, toId) {
  const safeMsg = {
    message: msg,
    from: fromId.toString(),
    to: toId.toString(),
    contactName: senderName,
    date: new Date().toISOString()
  };
  const data = JSON.stringify(safeMsg);
  wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(data));
}

const userCache = new Map();
const cacheSender = (id, name) => userCache.set(id.toString(), name);

async function sendAutoReply(entityId, userMsg) {
  try {
    const response = await claude.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 400,
      temperature: 0.7,
      messages: [{ role: "user", content: userMsg }],
      system: "You are a helpful customer support assistant."
    });

    const reply = response.content?.[0]?.text?.trim() || "I'm here to help!";
    const ent = await client.getEntity(entityId);
    await client.sendMessage(ent, { message: reply });

    const me = await client.getMe();
    broadcastMessage(reply, me.id.toString(), me.username || "Bot", entityId.toString());
  } catch (e) {
    console.error("❌ Auto-reply failed:", e);
  }
}

function attachListeners() {
  if (client && !client._listenersAttached) {
    client.addEventHandler(async event => {
      const msg = event.message?.message;
      if (!msg) return;

      const senderRaw = event.message.senderId;
      const senderId = senderRaw.value?.toString() || senderRaw.toString();
      let senderName = userCache.get(senderId) || "Unknown";

      if (senderName === "Unknown") {
        try {
          const ent = await client.getEntity(senderId);
          senderName = ent.username || ent.firstName || ent.title || "Unknown";
          cacheSender(senderId, senderName);
        } catch {}
      }

      broadcastMessage(msg, senderId, senderName, client?.session?.userId?.toString() ?? "self");
      sendAutoReply(senderId, msg);
    }, new NewMessage({}));
    client._listenersAttached = true;
  }
}

async function prepareClient() {
  if (!client) {
    client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
    await client.connect();
  }
}

app.post("/auth/send-code", async (req, res) => {
  const { phone } = req.body;
  try {
    await prepareClient();
    const result = await client.sendCode({ apiId, apiHash }, phone);
    cachedPhone = phone;
    phoneCodeHash = result.phoneCodeHash;
    res.json({ status: "code_sent" });
  } catch (err) {
    console.error("❌ send-code error:", err);
    if (err.message.includes("PHONE_NUMBER_BANNED")) {
      return res.status(403).json({ error: "Phone is banned." });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/verify", async (req, res) => {
  const { code, password } = req.body;
  try {
    if (!client) return res.status(400).json({ error: "Call /auth/send-code first." });

    if (password) {
      const pwd = await client.invoke(new Api.account.GetPassword());
      const passwordInput = await computeCheck(pwd, password);
      await client.invoke(new Api.auth.CheckPassword({ password: passwordInput }));
    } else {
      await client.invoke(new Api.auth.SignIn({
        phoneNumber: cachedPhone,
        phoneCodeHash,
        phoneCode: code,
      }));
    }

    const me = await client.getMe();
    const sessionString = client.session.save();
    attachListeners();

    res.json({
      status: "authenticated",
      session: sessionString,
      userId: me.id.toString(),
    });
  } catch (err) {
    console.error("❌ verify error:", err);
    const msg = err.message || "";
    if (msg.includes("SESSION_PASSWORD_NEEDED")) return res.json({ status: "need_password" });
    if (msg.includes("PHONE_CODE_INVALID") || msg.includes("PHONE_CODE_EXPIRED"))
      return res.status(400).json({ error: "Invalid or expired code." });

    return res.status(500).json({ error: msg });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const { contact, userId } = req.query;
    if (!contact || !userId) return res.status(400).json({ error: "Missing parameters" });

    const targetId = isNaN(Number(contact)) ? contact : Number(contact);
    const entity = await client.getEntity(targetId);
    const msgs = await client.getMessages(entity, { limit: 50 });

    const filtered = msgs
      .filter(m => m.message || m.media)
      .map(m => {
        const sid = m.senderId?.value ?? m.senderId;
        const sender = Number(sid);
        let content = m.message ?? "[media]";
        return {
          id: Number(m.id),
          sender_id: sender,
          message: content,
          date: m.date ? new Date(m.date * 1000).toISOString() : new Date().toISOString(),
          isSender: Number(userId) === sender
        };
      });

    res.json(filtered);
  } catch (err) {
    console.error("❌ messages error:", err);
    res.status(500).json({ error: (err.message || err).toString() });
  }
});

app.get("/contacts", async (req, res) => {
  try {
    const dialogs = await client.getDialogs();
    const contacts = dialogs
      .filter(d => (d.isUser || d.isChannel) && d.entity)
      .map(d => {
        const id = d.entity.id;
        let name = d.isChannel ? d.entity.title : d.entity.firstName || "Unknown";
        cacheSender(id.toString(), name);
        return {
          id: Number(id),
          username: d.entity.username || "",
          name,
          isChannel: !!d.isChannel
        };
      });
    res.json(contacts);
  } catch (err) {
    console.error("❌ contacts error:", err);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});

app.post("/send", async (req, res) => {
  const { message, to } = req.body;
  try {
    const target = isNaN(Number(to)) ? to : Number(to);
    const entity = await client.getEntity(target);
    const sent = await client.sendMessage(entity, { message });

    const me = await client.getMe();
    broadcastMessage(sent.message, me.id.toString(), me.username || "Me", target.toString());

    res.json({
      status: "sent",
      message: sent.message,
      date: sent.date ? new Date(sent.date * 1000).toISOString() : new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ send error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/logout", async (req, res) => {
  try {
    if (client) {
      await client.logOut();
      session = new StringSession("");
      client = null;
      console.log("🔓 Logged out and cleared session");
    }
    res.json({ status: "logged_out" });
  } catch (err) {
    console.error("❌ logout error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("🚀 Server running on http://localhost:3001"));
