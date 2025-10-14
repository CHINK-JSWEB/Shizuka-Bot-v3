const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function txt2video(prompt) {
  try {
    const { data: init } = await axios.post(
      "https://soli.aritek.app/txt2videov3",
      {
        deviceID:
          Math.random().toString(16).substring(2, 10) +
          Math.random().toString(16).substring(2, 10),
        prompt,
        used: [],
        versionCode: 51,
      },
      {
        headers: {
          authorization:
            "eyJzdWIiOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjoiSm9ubmVsIiwibmJmIjoxNzI4NjM3MTQwfQ==",
          "content-type": "application/json; charset=utf-8",
          "accept-encoding": "gzip",
          "user-agent": "okhttp/4.11.0",
        },
      }
    );

    if (!init?.key) throw new Error("Failed to retrieve key from API.");

    const { data: result } = await axios.post(
      "https://soli.aritek.app/video",
      { keys: [init.key] },
      {
        headers: {
          authorization:
            "eyJzdWIiOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjoiSm9ubmVsIiwibmJmIjoxNzI4NjM3MTQwfQ==",
          "content-type": "application/json; charset=utf-8",
          "accept-encoding": "gzip",
          "user-agent": "okhttp/4.11.0",
        },
      }
    );

    const url = result?.datas?.[0]?.url;
    if (!url) throw new Error("No video URL returned from API.");

    return url;
  } catch (err) {
    console.error("txt2video error:", err.message);
    throw new Error("API error: " + err.message);
  }
}

module.exports = {
  name: "videogpt",
  description: "Generate a video from text using Soli AI",
  usage: "videogpt <prompt>",
  cooldown: 5,
  hasPermission: 0,
  usePrefix: true,
  credits: "Jonnel",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a text prompt.\nUsage: videogpt <prompt>",
        threadID,
        messageID
      );
    }

    const tempPath = path.join(__dirname, "temp_videogpt.mp4");
    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const videoUrl = await txt2video(prompt);

      const response = await axios.get(videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempPath);

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          {
            body: `🎬 Here's your video for: "${prompt}"`,
            attachment: fs.createReadStream(tempPath),
          },
          threadID,
          messageID
        );
        api.setMessageReaction("✅", messageID, () => {}, true);
        fs.unlinkSync(tempPath);
      });

      writer.on("error", (err) => {
        console.error("Write error:", err);
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        api.sendMessage("⚠️ Error writing video file.", threadID, messageID);
      });
    } catch (err) {
      console.error("videogpt execute error:", err);
      api.setMessageReaction("⚠️", messageID, () => {}, true);
      api.sendMessage(
        "⚠️ Error generating video. The API might be unavailable or your key may be invalid.",
        threadID,
        messageID
      );
    }
  },
};