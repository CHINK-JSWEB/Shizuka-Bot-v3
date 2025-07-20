const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "videogpt",
  description: "Generate video directly and send to Messenger via Nekorinn API",
  usage: "videogpt <prompt>",
  cooldown: 5, // per-user cooldown
  hasPermission: 0,
  usePrefix: true,
  credits: "Nikox",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!args[0]) {
      return api.sendMessage("❌ Please provide a prompt.\nUsage: videogpt <your prompt>", threadID, messageID);
    }

    const prompt = args.join(" ");
    const apiUrl = `https://api.nekorinn.my.id/ai-vid/videogpt?text=${encodeURIComponent(prompt)}`;
    const tempPath = path.join(__dirname, "temp_videogpt.mp4");

    try {
      // Axios GET with stream response
      const res = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempPath);

      res.data.pipe(writer);
      writer.on("finish", async () => {
        // Send the downloaded video file
        await api.sendMessage({
          body: `🎥 Here's your video for: "${prompt}"`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, messageID);

        fs.unlinkSync(tempPath); // Clean up
      });
      writer.on("error", (err) => {
        console.error("❌ Write stream error:", err);
        api.sendMessage("⚠️ Error saving video.", threadID, messageID);
      });
    } catch (err) {
      console.error("❌ VideoGPT command error:", err);
      api.sendMessage("⚠️ Error generating video. Try again later.", threadID, messageID);
    }
  }
};
