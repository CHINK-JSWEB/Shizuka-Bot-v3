const fs = require("fs");
const path = require("path");

module.exports = {
  name: "lolo",
  version: "1.0",
  usage: "!lolo",
  description: "Send a video file only.",
  cooldown: 3, // optional, in seconds

  execute: async ({ api, event }) => {
    console.log("📼 Running command: lolo");

    const videoPath = path.join(__dirname, "..", "assets", "lolo.mp4");

    if (!fs.existsSync(videoPath)) {
      console.warn("⚠️ Video file not found:", videoPath);
      return api.sendMessage("❌ Video not found.", event.threadID);
    }

    const message = {
      attachment: fs.createReadStream(videoPath)
    };

    try {
      await api.sendMessage(message, event.threadID);
      console.log("✅ Video sent successfully.");
    } catch (err) {
      console.error("❌ Failed to send video:", err);
      api.sendMessage("❌ Error sending video.", event.threadID);
    }
  }
};
