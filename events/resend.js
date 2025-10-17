const fs = require("fs");
const axios = require("axios");
const path = require("path");

const STATUS_FILE = path.join(__dirname, "resend-status.json");
const ADMIN_ID = "100082770721408"; // boss lang

// Load or initialize status
let status = { enabled: true };
if (fs.existsSync(STATUS_FILE)) {
  try { status = JSON.parse(fs.readFileSync(STATUS_FILE)); } 
  catch (e) { console.error("❌ Failed to load resend status:", e); }
} else {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

// In-memory cache for messages
const cache = new Map();

module.exports = {
  config: { eventType: ["message", "message_unsend"] },

  run: async function ({ api, event }) {
    const { threadID, messageID, type, senderID, body } = event;
    const botID = api.getCurrentUserID();

    // ---- Command for admin toggle ----
    if (type === "message" && senderID === ADMIN_ID && body) {
      const msg = body.trim().toLowerCase();
      if (msg === "!resend on") {
        status.enabled = true;
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
        return api.sendMessage("✅ Resend enabled", threadID);
      }
      if (msg === "!resend off") {
        status.enabled = false;
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
        return api.sendMessage("❌ Resend disabled", threadID);
      }
    }

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
    if (type === "message_unsend" && status.enabled) {
      const threadCache = cache.get(threadID);
      if (!threadCache) return;

      const original = threadCache.get(messageID);
      if (!original || original.senderID === botID) return;

      // Get sender name
      let senderName = "Unknown User";
      try {
        const userInfo = await api.getUserInfo(original.senderID);
        if (userInfo[original.senderID]?.name) senderName = userInfo[original.senderID].name;
      } catch (e) { console.error(e); }

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

      api.sendMessage({ body: resendBody, attachment: attachmentStreams.length ? attachmentStreams : undefined }, threadID);
    }
  }
};