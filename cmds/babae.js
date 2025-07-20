const fs = require("fs");
const path = require("path");

module.exports = {
  name: "babae",
  version: "1.0",
  usage: "!babae",
  description: "Send a babae video.",
  cooldown: 3,

  execute: async ({ api, event }) => {
    console.log("📼 Running command: babae");

    const videoPath = path.join(__dirname, "..", "assets", "babae.mp4");

    if (!fs.existsSync(videoPath)) {
      console.warn("⚠️ babae.mp4 not found:", videoPath);
      return api.sendMessage("❌ Video not found.", event.threadID);
    }

    const message = {
      attachment: fs.createReadStream(videoPath)
    };

    try {
      await api.sendMessage(message, event.threadID);
      console.log("✅ babae video sent successfully.");

      // Send "☕women" text after video
      await api.sendMessage("☕women", event.threadID);
    } catch (err) {
      console.error("❌ Failed to send babae video:", err);
      api.sendMessage("❌ Error sending video.", event.threadID);
    }
  }
};
