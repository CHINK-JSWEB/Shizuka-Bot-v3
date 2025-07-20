const axios = require("axios");

// Cooldown map: userID => last used timestamp
const cooldown = new Map();

module.exports = {
  config: {
    name: "nikox-ai",
    version: "1.0",
    author: "Nikox",
    description: "Auto-reply using Nikox AI (Gemini 2.0 Flash)",
    eventType: ["message", "message_reply"]
  },

  async run({ api, event }) {
    const { senderID, threadID, messageID, body } = event;

    if (!body || senderID === api.getCurrentUserID()) return;

    const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes cooldown
    const now = Date.now();
    const lastUsed = cooldown.get(senderID);

    if (lastUsed && now - lastUsed < COOLDOWN_TIME) return;

    cooldown.set(senderID, now);
    setTimeout(() => cooldown.delete(senderID), COOLDOWN_TIME);

    api.sendTypingIndicator(threadID);

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBAhNxtNCA7jHJG2kjPQ7aFImWNltKelEQ",
        {
          contents: [{ parts: [{ text: body.trim() }] }]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!reply) throw new Error("Walang sagot si Nikox AI.");

      const formattedReply = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 𝗡𝗜𝗞𝗢𝗫 𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reply}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

      return api.sendMessage(formattedReply, threadID, messageID);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;

      const formattedError = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 𝗡𝗜𝗞𝗢𝗫 𝗔𝗜 𝗘𝗥𝗥𝗢𝗥
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hindi makausap si Nikox AI ngayon.

Details: ${errorMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

      return api.sendMessage(formattedError, threadID, messageID);
    }
  }
};
