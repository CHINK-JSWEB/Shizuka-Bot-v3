const axios = require("axios");
const cache = new Map();

module.exports = {
  config: {
    eventType: ["message", "message_unsend"]
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, type, senderID } = event;
    const botID = api.getCurrentUserID();

    // Store user message if it's not from the bot
    if (type === "message" && senderID !== botID && (event.body || event.attachments?.length > 0)) {
      if (!cache.has(threadID)) {
        cache.set(threadID, new Map());
      }

      cache.get(threadID).set(messageID, {
        senderID,
        body: event.body || "",
        attachments: event.attachments || []
      });
    }

    // Handle unsend
    if (type === "message_unsend") {
      const threadCache = cache.get(threadID);
      if (!threadCache) return;

      const original = threadCache.get(messageID);
      if (!original || original.senderID === botID) return;

      // Get sender name
      let senderName = "Unknown User";
      try {
        const userInfo = await api.getUserInfo(original.senderID);
        if (userInfo[original.senderID]?.name) {
          senderName = userInfo[original.senderID].name;
        }
      } catch (e) {
        console.error("❌ Error getting user name:", e);
      }

      const resendBody = `🔁 Message unsent by ${senderName}:\n\n${original.body || "[Attachment Only]"}`;

      const attachmentStreams = [];

      for (const item of original.attachments) {
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

      // Send message with name and attachments
      api.sendMessage({
        body: resendBody,
        attachment: attachmentStreams.length > 0 ? attachmentStreams : undefined
      }, threadID, (err, info) => {
        if (!err && info?.messageID) {
          // Auto delete after 60 seconds
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 60 * 1000);
        }
      });
    }
  }
};
