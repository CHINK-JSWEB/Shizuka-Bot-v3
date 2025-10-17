const fs = require("fs");
const axios = require("axios");
const path = require("path");

// File kung saan naka-store ang per-thread toggle
const TOGGLE_FILE = path.join(__dirname, "../cmds/resendToggle.json");
let toggle = {};
try { toggle = require(TOGGLE_FILE); } catch {}

// In-memory cache for messages
const cache = new Map();

module.exports = {
  config: { eventType: ["message", "message_unsend"] },

  run: async function ({ api, event }) {
    const { threadID, messageID, type, senderID, body } = event;
    const botID = api.getCurrentUserID();

    // ---- Store message if not from bot ----
    if (type === "message" && senderID !== botID && (body || event.attachments?.length)) {
      if (!cache.has(threadID)) cache.set(threadID, new Map());
      cache.get(threadID).set(messageID, {
        senderID,
        body: body || "",
        attachments: event.attachments || []
      });
    }

    // ---- Handle unsend ----
    if (type === "message_unsend") {
      // Check kung auto-resend ay enabled sa thread
      const isEnabled = toggle[threadID];
      if (!isEnabled) return;

      const threadCache = cache.get(threadID);
      if (!threadCache) return;

      const original = threadCache.get(messageID);
      if (!original || original.senderID === botID) return;

      // Get sender name
      let senderName = "Unknown User";
      try {
        const userInfo = await api.getUserInfo(original.senderID);
        if (userInfo[original.senderID]?.name) senderName = userInfo[original.senderID].name;
      } catch (e) { console.error("❌ Error getting user name:", e); }

      const resendBody = `🔁 Message unsent by ${senderName}:\n\n${original.body || "[Attachment Only]"}`;

      const attachmentStreams = [];
      for (const item of original.attachments) {
        if (["photo","video","sticker","animated_image","audio","file"].includes(item.type) && item.url) {
          try {
            const res = await axios.get(item.url, { responseType: "stream" });
            attachmentStreams.push(res.data);
          } catch (err) { console.error("❌ Failed to fetch attachment:", err.message); }
        }
      }

      // Send the message back
      api.sendMessage(
        { body: resendBody, attachment: attachmentStreams.length ? attachmentStreams : undefined },
        threadID
      );
    }
  }
};