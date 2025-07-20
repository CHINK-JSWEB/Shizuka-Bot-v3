const axios = require("axios");
const fs = require("fs");
const path = require("path");

const activeThreads = new Set();

exports.config = {
  name: "music",
  version: "3.6",
  countDown: 3,
  role: 0,
  author: "Nikox",
  description: "Play music using Nekorinn API",
  guide: {
    en: "music [song title]"
  }
};

exports.execute = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const botID = api.getCurrentUserID?.() || api.getCurrentUserID();
  if (senderID === botID) return;

  if (!args.length) {
    return api.sendMessage("❗ Usage: music [title]", threadID, messageID);
  }

  if (activeThreads.has(threadID)) {
    return api.sendMessage("⚠️ Please wait for the current song to finish processing.", threadID, messageID);
  }

  activeThreads.add(threadID);

  const title = args.join(" ");
  const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay?q=${encodeURIComponent(title)}`;
  const randomViews = Math.floor(Math.random() * (10000000 - 1000000) + 1000000).toLocaleString();

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const res = await axios.get(apiUrl);
    const result = res.data.result;

    if (!result || !result.downloadUrl) {
      activeThreads.delete(threadID);
      return api.sendMessage("❌ Failed to get music data.", threadID, messageID);
    }

    const filePath = path.join(__dirname, "music-temp.mp3");
    const writer = fs.createWriteStream(filePath);
    const audioStream = await axios({
      url: result.downloadUrl,
      method: "GET",
      responseType: "stream"
    });

    audioStream.data.pipe(writer);

    writer.on("finish", () => {
      const artist = result.uploader || "Unknown Artist";
      const duration = result.duration || "Unknown Duration";

      const msg = {
        body: `🎶🎵 ${title}\n🎤 Artist: ${artist}\n⏱ Duration: ${duration}\n👁 Views: ${randomViews}+`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(msg, threadID, () => {
        fs.unlinkSync(filePath);
        api.sendMessage("🎶 ENJOY YOUR MUSIC 🎶", threadID);
        api.setMessageReaction("✅", messageID, () => {}, true);
        activeThreads.delete(threadID);
      });
    });

    writer.on("error", (err) => {
      console.error("❌ File write error:", err);
      api.sendMessage("❌ Failed to save MP3 file.", threadID, messageID);
      activeThreads.delete(threadID);
    });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    activeThreads.delete(threadID);
  }
};
