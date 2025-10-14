const axios = require("axios");

// Cooldown map: userID => last usage timestamp
const cooldowns = new Map();

module.exports = {
  name: "gemini",
  version: "1.5",
  hasPrefix: false,
  description: "Ask Gemini 2.0 Flash via API with stylish response",
  usage: "gemini <question>",
  credits: "Jonnel",

  async execute({ api, event, args }) {
    const userId = event.senderID;
    const now = Date.now();

    // Cooldown check: 10 seconds
    if (cooldowns.has(userId)) {
      const lastUsed = cooldowns.get(userId);
      if (now - lastUsed < 10000) {
        return api.sendMessage(
          `⏳ Please wait ${Math.ceil((10000 - (now - lastUsed)) / 1000)} seconds before using this command again.`,
          event.threadID,
          event.messageID
        );
      }
    }

    const prompt = args.join(" ").trim();
    if (!prompt) {
      return api.sendMessage(
        "❌ Please enter a question.\n📌 Usage: gemini <question>",
        event.threadID,
        event.messageID
      );
    }

    cooldowns.set(userId, now);

    try {
      // Start typing/thinking status
      api.sendTypingIndicator(event.threadID, true);

      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBAhNxtNCA7jHJG2kjPQ7aFImWNltKelEQ",
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const result = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!result) throw new Error("No response from Gemini.");

      const message =
`🟢⚪🔴 GEMINI 2.0 Flash Response:
━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`
${result.trim()}
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━
Powered by Jonnel`;

      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      console.error("Gemini API Error:", err.response?.data || err.message);
      return api.sendMessage(
        `❌ Gemini Error:\n${err.response?.data?.error?.message || err.message || "Unknown error."}`,
        event.threadID,
        event.messageID
      );

    } finally {
      // Stop typing/thinking status with slight delay for smoothness
      setTimeout(() => api.sendTypingIndicator(event.threadID, false), 500);
    }
  }
};