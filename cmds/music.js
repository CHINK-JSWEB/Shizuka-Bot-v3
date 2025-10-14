const axios = require("axios");
const fs = require("fs");
const path = require("path");

const activeThreads = new Set();

exports.config = {
  name: "music",
  version: "4.0",
  countDown: 3,
  role: 0,
  author: "Jonnel",
  description: "Play Apple Music preview via Kaizenji API",
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
    return api.sendMessage("⚠️ Please wait, still processing the current song...", threadID, messageID);
  }

  activeThreads.add(threadID);

  const title = args.join(" ");
  const apiUrl = `https://kaiz-apis.gleeze.com/api/apple-music?search=${encodeURIComponent(title)}&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`;

  try {
    api.setMessageReaction("🎧", messageID, () => {}, true);

    const res = await axios.get(apiUrl);
    const results = res.data.response;

    if (!results || results.length === 0) {
      activeThreads.delete(threadID);
      return api.sendMessage("❌ No results found.", threadID, messageID);
    }

    const song = results[0]; // kukunin lang natin ang unang result
    const filePath = path.join(__dirname, "applemusic_preview.m4a");

    const writer = fs.createWriteStream(filePath);
    const audioStream = await axios({
      url: song.previewMp3,
      method: "GET",
      responseType: "stream"
    });

    audioStream.data.pipe(writer);

    writer.on("finish", () => {
      const caption = `🎶 ${song.title}\n🎤 Artist: ${song.artist}\n💿 Album: ${song.album}\n📅 Released: ${song.releaseDate}\n⏱ Duration: ${song.duration}\n🔗 Apple Music: ${song.url}`;

      api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", messageID, () => {}, true);
        api.sendMessage("🎵 Enjoy listening!", threadID);
        activeThreads.delete(threadID);
      });
    });

    writer.on("error", err => {
      console.error("❌ File write error:", err);
      api.sendMessage("❌ Failed to save audio file.", threadID, messageID);
      activeThreads.delete(threadID);
    });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    activeThreads.delete(threadID);
  }
};