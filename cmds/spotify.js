const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "spotify",
  version: "5.3",
  hasPrefix: false,
  description: "Spotify-style song search with direct MP3 download",
  usage: "spotify <song name>",
  credits: "JONNEL SORIANO",

  async execute({ api, event, args }) {
    const autoDelete = 30000; // 30 seconds for errors only

    if (!args[0]) {
      const msg = await api.sendMessage(
        "🎧 Usage: spotify <song name>\nExample: spotify Tibok",
        event.threadID
      );
      setTimeout(() => api.unsendMessage(msg.messageID), autoDelete);
      return;
    }

    const query = args.join(" ");
    const apiUrl = `https://golden-bony-solidstatedrive.vercel.app/download/spotysearch?search=${encodeURIComponent(query)}`;

    try {
      const searchMsg = await api.sendMessage(
        "🔍 Searching and preparing the song...",
        event.threadID
      );

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.status || !data.result || !data.result.download_url) {
        const errMsg = await api.sendMessage(
          "❌ No result found or API error.",
          event.threadID
        );
        setTimeout(() => api.unsendMessage(errMsg.messageID), autoDelete);
        await api.unsendMessage(searchMsg.messageID);
        return;
      }

      const result = data.result;
      const title = result.title || "Unknown Title";
      const artists = result.artists || "Unknown Artist";
      const thumbnail = result.thumbnail || "https://i.imgur.com/ZJj2K5S.png";
      const audioUrl = result.download_url;

      // Format duration
      let durationFormatted = "Unknown";
      if (result.duration) {
        const minutes = Math.floor(result.duration / 60000);
        const seconds = Math.floor((result.duration % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        durationFormatted = `${minutes}:${seconds}`;
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // Download MP3
      const mp3Path = path.join(__dirname, `song_${Date.now()}.mp3`);
      const audioRes = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(mp3Path, audioRes.data);

      // Download cover
      const imgPath = path.join(__dirname, `cover_${Date.now()}.jpg`);
      const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgRes.data);

      await api.unsendMessage(searchMsg.messageID);

      // Send info
      await api.sendMessage(
        {
          body: `🎧 SPOTIFY STYLE\n\n🎵 Title: ${title}\n🎤 Artist: ${artists}\n🕒 Duration: ${durationFormatted}\n👑 OWNER: JONNEL SORIANO`,
          attachment: fs.createReadStream(imgPath),
        },
        event.threadID
      );

      fs.unlinkSync(imgPath);

      // Send MP3
      await api.sendMessage(
        {
          body: "✅ Here’s your song 🎶",
          attachment: fs.createReadStream(mp3Path),
        },
        event.threadID
      );

      fs.unlinkSync(mp3Path);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      setTimeout(() => api.setMessageReaction("", event.messageID, () => {}, true), 4000);
    } catch (err) {
      console.error("❌ Spotify Error:", err.message);
      const errMsg = await api.sendMessage(
        "❌ Error fetching the song. Please try again later.",
        event.threadID
      );
      setTimeout(() => api.unsendMessage(errMsg.messageID), autoDelete);
    }
  },
};