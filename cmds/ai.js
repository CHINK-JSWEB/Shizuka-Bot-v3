const axios = require("axios");

module.exports = {
  name: "ai",
  version: "1.1",
  usePrefix: false,
  description: "Talk with Jonnel AI",
  usage: "ai [your message]",
  credits: "Creator: Jonnel Soriano",

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        `❗ Usage: ai [your message]\nExample: ai Hello, how are you?`,
        threadID,
        messageID
      );
    }

    const url = `https://kaiz-apis.gleeze.com/api/kaiz-ai?ask=${encodeURIComponent(query)}&uid=${senderID}&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`;

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      api.sendMessage(
        `🟢⚪🔴 𝗝𝗢𝗡𝗡𝗘𝗟 𝗔𝗜 𝗥𝗘𝗣𝗟𝗬 🟢⚪🔴\n\n⏳ Thinking...`,
        threadID,
        messageID
      );

      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.response) {
        return api.sendMessage(
          `⚠️ Sorry, Jonnel AI couldn't generate a response. Try again!`,
          threadID,
          messageID
        );
      }

      const timestamp = new Date();
      const timeString = timestamp.toLocaleTimeString();
      const dateString = timestamp.toLocaleDateString();

      const msg = `🟢⚪🔴 𝗝𝗢𝗡𝗡𝗘𝗟 𝗔𝗜 𝗥𝗘𝗣𝗟𝗬 🟢⚪🔴
📌 *Query:* ${query}
👨‍💻 *Creator:* Jonnel Soriano
🕒 *Time:* ${timeString}
📅 *Date:* ${dateString}
━━━━━━━━━━━━━━
💡 *Response:*
${data.response}
━━━━━━━━━━━━━━
✅ Enjoy your chat with Jonnel AI!`;

      api.sendMessage(msg, threadID, messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      api.sendMessage("❌ Error contacting Jonnel AI API.", threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};