const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "spotify",
  version: "4.3",
  hasPrefix: false,
  description: "Spotify-style song search with MP3 download from YouTube",
  usage: "spotify <song name>",
  credits: "ANGEL NICO IGDALINO",

  async execute({ api, event, args }) {
    if (!args[0]) {
      const msg = await api.sendMessage("🎧 Usage: spotify <song name>\nExample: spotify Tibok", event.threadID);
      setTimeout(() => api.unsendMessage(msg.messageID), 5000);
      return;
    }

    const query = args.join(" ");
    const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay?q=${encodeURIComponent(query)}`;

    try {
      // Send searching status and delete after 5s
      const searchMsg = await api.sendMessage("🔍 Searching and preparing the song...", event.threadID);
      if (searchMsg?.messageID) {
        setTimeout(() => api.unsendMessage(searchMsg.messageID), 5000);
      }

      const res = await axios.get(apiUrl);
      const data = res.data.result;

      if (!data || !data.downloadUrl) {
        const errMsg = await api.sendMessage("❌ No result found or API error.", event.threadID);
        setTimeout(() => api.unsendMessage(errMsg.messageID), 5000);
        return;
      }

      const { title, channel, duration, cover, url: ytUrl } = data.metadata;
      const audioUrl = data.downloadUrl;

      // React ⏳ to user's command message
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // Download cover image
      const imgPath = path.join(__dirname, "cover.jpg");
      const imgRes = await axios.get(cover, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgRes.data);

      const infoMsg = {
        body:
`🎧 SPOTIFY STYLE (YouTube Source)
🎵 Title: ${title}
🎤 Artist: ${channel}
💽 Album: YouTube Singles
🕒 Duration: ${duration}
📅 Release: Unknown
🔗 YouTube: ${ytUrl}
👑 OWNER: ANGEL NICO IGDALINO`,
        attachment: fs.createReadStream(imgPath)
      };

      // Send info + cover
      api.sendMessage(infoMsg, event.threadID, async () => {
        fs.unlinkSync(imgPath);

        // Download MP3
        const mp3Path = path.join(__dirname, "song.mp3");
        const writer = fs.createWriteStream(mp3Path);
        const response = await axios.get(audioUrl, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
          api.setMessageReaction("", event.messageID, () => {}, true); // remove ⏳
          api.sendMessage(
            { attachment: fs.createReadStream(mp3Path) },
            event.threadID,
            () => fs.unlinkSync(mp3Path)
          );
        });

        writer.on("error", async (err) => {
          console.error("❌ MP3 download error:", err.message);
          const errMsg = await api.sendMessage("❌ Failed to download the MP3.", event.threadID);
          setTimeout(() => api.unsendMessage(errMsg.messageID), 5000);
        });
      }, event.messageID);

    } catch (err) {
      console.error("❌ Spotify Error:", err.message);
      const errMsg = await api.sendMessage("❌ Something went wrong while fetching the song.", event.threadID);
      setTimeout(() => api.unsendMessage(errMsg.messageID), 5000);
    }
  }
};
