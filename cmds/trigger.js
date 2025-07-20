const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "trigger",
    version: "1.0",
    author: "Nikox",
    description: "Send a triggered GIF or image from assets/triggered",
    category: "fun",
    role: 0,
    usePrefix: false,
  },

  onStart: async () => {},

  execute: async ({ api, event }) => {
    const triggerWords = ["trigger", "galit", "bwisit", "asaran"];
    const message = event.body?.toLowerCase();

    if (!message) return;

    const isTriggered = triggerWords.some(word => message.includes(word));
    if (!isTriggered) return;

    const folderPath = path.join(__dirname, "..", "assets", "triggered");

    // Check for images
    let files = [];
    try {
      files = fs.readdirSync(folderPath).filter(file =>
        file.match(/\.(gif|png|jpe?g)$/i)
      );
    } catch (e) {
      return api.sendMessage("❌ Missing folder: /assets/triggered/", event.threadID, event.messageID);
    }

    if (files.length === 0) {
      return api.sendMessage("⚠️ Walang image o GIF sa /assets/triggered/", event.threadID, event.messageID);
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(folderPath, randomFile);

    const stream = fs.createReadStream(filePath);
    return api.sendMessage({
      body: "🔥 Triggered ka na ba?",
      attachment: stream
    }, event.threadID, event.messageID);
  }
};
