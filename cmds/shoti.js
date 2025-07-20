const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    version: "2.0",
    author: "Nikox",
    countDown: 5,
    role: 0,
    shortDescription: "Random Shoti video with info",
    guide: {
      en: "Use {pn} to get a random Shoti video"
    }
  },

  async execute({ api, event }) {
    const videoPath = path.join(__dirname, "..", "cache", `shoti_${Date.now()}.mp4`);

    // React ⏳ to show it's fetching
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // Send "Fetching..." message
    const statusMessage = await new Promise(resolve => {
      api.sendMessage("🔄 Fetching random Shoti video...", event.threadID, (err, info) => resolve(info));
    });

    try {
      const res = await axios.get("https://kaiz-apis.gleeze.com/api/shoti?apikey=4c92e1a3-4b13-4890-bff2-c494425a1d1d");
      const data = res.data.shoti;

      if (!data || !data.videoUrl) {
        api.sendMessage("❌ No video found from API.", event.threadID, () => {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
        });
        return;
      }

      const info = `📽️ 𝗦𝗛𝗢𝗧𝗜 𝗩𝗜𝗗𝗘𝗢
👤 Author: ${data.nickname} (@${data.username})
📝 Title: ${data.title}
🌎 Region: ${data.region}
⏱ Duration: ${data.duration}s
📸 By: Nikox`;

      const videoStream = await axios.get(data.videoUrl, { responseType: "stream" });

      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: info,
          attachment: fs.createReadStream(videoPath)
        }, event.threadID, () => {
          fs.unlinkSync(videoPath);
          // Delete status + fetching message after 5s
          setTimeout(() => {
            api.unsendMessage(statusMessage.messageID);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
          }, 5000);
        });
      });

      writer.on("error", err => {
        console.error("Video save error:", err);
        api.sendMessage("❌ Failed to download video.", event.threadID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("API error:", err.message);
      api.sendMessage("❌ Error getting video from Shoti API.", event.threadID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
