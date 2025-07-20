const axios = require("axios");

module.exports = {
  name: "ai",
  version: "1.0",
  usePrefix: false,
  description: "Talk with Nikox AI",
  usage: "ai [your message]",

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❗ Usage: ai [your message]", threadID, messageID);
    }

    const url = `https://kaiz-apis.gleeze.com/api/kaiz-ai?ask=${encodeURIComponent(query)}&uid=${senderID}&apikey=4c92e1a3-4b13-4890-bff2-c494425a1d1d`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.response) {
        return api.sendMessage("⚠️ No valid response from Nikox AI.", threadID, messageID);
      }

      return api.sendMessage(`🤖 Nikox AI returned:\n\n${data.response}`, threadID, messageID);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      return api.sendMessage("❌ Error contacting Nikox AI API.", threadID, messageID);
    }
  }
};
