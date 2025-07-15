const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = "";
const apiHash = "";
const stringSession = new StringSession("");

(async () => {
  console.log("⚙️ Starting Telegram session generation...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📱 Enter your phone number: "),
    password: async () => await input.text("🔑 Enter your 2FA password (if enabled): "),
    phoneCode: async () => await input.text("📨 Enter the code you received: "),
    onError: (err) => console.log("❌ Error:", err),
  });

  console.log("✅ Logged in successfully!");
  console.log("📦 Your session string:");
  console.log(client.session.save());

  await client.disconnect();
})();
