const axios = require("axios");
const cache = new Map();

module.exports = {
  config: {
    name: "resend",
    eventType: ["message", "message_unsend"]
  },

  run: async function ({ api, event }) {
    try {
      const { threadID, messageID, type, senderID } = event;
      const botID = api.getCurrentUserID();

      // ✅ Save messages
      if (type === "message" && senderID !== botID && (event.body || event.attachments?.length > 0)) {
        if (!cache.has(threadID)) cache.set(threadID, new Map());

        cache.get(threadID).set(messageID, {
          senderID,
          body: event.body || "",
          attachments: event.attachments || []
        });
        return;
      }

      // 🧩 Detect unsent message
      if (type === "message_unsend") {
        const threadCache = cache.get(threadID);
        if (!threadCache) return;

        const original = threadCache.get(messageID);
        if (!original || original.senderID === botID) return;

        // Get sender name
        let senderName = "Unknown User";
        try {
          const userInfo = await api.getUserInfo(original.senderID);
          senderName = userInfo?.[original.senderID]?.name || "Unknown User";
        } catch {}

        const resendBody = `🔁 Message unsent by ${senderName}:\n\n${original.body || "[Attachment Only]"}`;

        // 📎 Re-fetch attachments if needed
        const attachmentStreams = [];
        for (const item of original.attachments || []) {
          if (
            ["photo", "video", "sticker", "animated_image", "audio", "file"].includes(item.type) &&
            item.url
          ) {
            try {
              const res = await axios.get(item.url, { responseType: "stream" });
              attachmentStreams.push(res.data);
            } catch (err) {
              console.error("❌ Failed to fetch attachment:", err.message);
            }
          }
        }

        // 🕵️‍♂️ Permanently reveal the unsent message (no auto-delete)
        api.sendMessage(
          { body: resendBody, attachment: attachmentStreams.length > 0 ? attachmentStreams : undefined },
          threadID
        );
      }
    } catch (err) {
      console.error("❌ Error in resend.js:", err);
    }
  }
};