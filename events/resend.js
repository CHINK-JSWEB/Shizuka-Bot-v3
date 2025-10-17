const fs = require("fs");
const axios = require("axios");
const path = require("path");
const cache = new Map();
const togglePath = path.join(__dirname, "../antiunsend.json");

// 🔑 Ikaw lang ang master boss Jonnel 😎
const MASTER_ID = "100082770721408";

// 🔄 Load or create toggle file
if (!fs.existsSync(togglePath)) {
  fs.writeFileSync(togglePath, JSON.stringify({ enabled: true }, null, 2));
}
let toggleData = JSON.parse(fs.readFileSync(togglePath));

module.exports = {
  config: {
    eventType: ["message", "message_unsend"]
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, type, senderID, body } = event;
    const botID = api.getCurrentUserID();

    // 🧩 TOGGLE COMMAND (+antiunsend on/off)
    if (type === "message" && body) {
      const lower = body.toLowerCase().trim();
      if (lower === "+antiunsend on" || lower === "+antiunsend off") {
        // ✅ Only master can use this
        if (senderID !== MASTER_ID) {
          console.log(`🚫 User ${senderID} tried to toggle Anti-Unsend.`);
          return api.sendMessage(
            "⛔ Sorry, only the bot master can toggle Anti-Unsend mode.",
            threadID
          );
        }

        const enable = lower.endsWith("on");
        toggleData.enabled = enable;
        fs.writeFileSync(togglePath, JSON.stringify(toggleData, null, 2));

        return api.sendMessage(
          enable
            ? "✅ Anti-Unsend mode is now **ON** — deleted messages will be recovered."
            : "🚫 Anti-Unsend mode is now **OFF** — deleted messages will be ignored.",
          threadID
        );
      }
    }

    // 🧠 Save messages for recovery
    if (type === "message" && senderID !== botID) {
      if (!cache.has(threadID)) cache.set(threadID, new Map());
      cache.get(threadID).set(messageID, {
        senderID,
        body: body || "",
        attachments: event.attachments || []
      });
    }

    // 🔁 Handle unsend event
    if (type === "message_unsend") {
      if (!toggleData.enabled) return; // ❌ Stop if anti-unsend is off

      const threadCache = cache.get(threadID);
      if (!threadCache) return;

      const original = threadCache.get(messageID);
      if (!original || original.senderID === botID) return;

      // 🧾 Get user name
      let senderName = "Unknown User";
      try {
        const info = await api.getUserInfo(original.senderID);
        senderName = info?.[original.senderID]?.name || "Unknown User";
      } catch (err) {
        console.error("❌ Error fetching user info:", err.message);
      }

      // 💬 Message format
      const resendBody = `🧠💬 ${senderName} tried to unsend a message!\n━━━━━━━━━━━━━━\n💌 Message:\n${original.body || "[Attachment Only]"}`;

      // 📎 Re-fetch attachments
      const attachmentStreams = [];
      for (const item of original.attachments) {
        if (item?.url) {
          try {
            const res = await axios.get(item.url, { responseType: "stream" });
            attachmentStreams.push(res.data);
          } catch (e) {
            console.error("❌ Failed to fetch attachment:", e.message);
          }
        }
      }

      // 🚨 Send recovered message
      api.sendMessage(
        {
          body: resendBody,
          attachment: attachmentStreams.length > 0 ? attachmentStreams : undefined,
          mentions: [{ tag: senderName, id: original.senderID }]
        },
        threadID
      );

      console.log(`⚡ Anti-Unsend triggered for ${senderName}`);
    }
  }
};