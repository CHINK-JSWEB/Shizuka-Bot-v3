const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.1",
    author: "Jonnel",
    countDown: 5,
    role: 0,
    shortDescription: "About bot & owner",
    longDescription: "Displays information about JonnelBot and its developer",
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const gifPath = path.join(__dirname, "../assets/nikox.gif");

    const messageBody =
      "👑 Jonnel Bot Assistant\n\n" +
      "Hi! I'm Nobita Bot, your AI assistant.\n" +
      "Powered by ⚙️ Node.js and the WS3-FCA Facebook Chat API.\n\n" +
      "If you encounter a bug, consider contacting the owner: Jonnel Soriano";

    if (fs.existsSync(gifPath)) {
      await api.sendMessage(
        {
          body: messageBody,
          attachment: fs.createReadStream(gifPath)
        },
        threadID
      );
    } else {
      await api.sendMessage(messageBody, threadID);
    }
  }
};
