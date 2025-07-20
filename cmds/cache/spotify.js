const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "spotify",
  version: "3.2",
  hasPrefix: false,
  description: "Spotify-style song search with MP3 download from YouTube",
  usage: "spotify <song name>",
  credits: "ANGEL NICO IGDALINO", // ✅ NAME IN ALL CAPS

  async execute({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage("🎧 Usage: spotify <song name>\nExample: spotify Tibok", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const url = `https://api.nekorinn.my.id/downloader/ytplay?q=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(url);
      const data = res.data.result;

      if (!data || !data.downloadUrl) {
        return api.sendMessage("❌ No result found or API error.", event.threadID, event.messageID);
      }

      const { title, channel, duration, cover, url: ytUrl } = data.metadata;
      const audioUrl = data.downloadUrl;

      const imgPath = path.join(__dirname, "cover.jpg");
      const imgRes = await axios.get(cover, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgRes.data);

      const message = {
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

      // Send Cover + Info first
      api.sendMessage(message, event.threadID, async () => {
        fs.unlinkSync(imgPath);

        // Then download and send MP3
        const mp3Path = path.join(__dirname, "song.mp3");
        const writer = fs.createWriteStream(mp3Path);
        const audioStream = await axios.get(audioUrl, { responseType: "stream" });
        audioStream.data.pipe(writer);

        writer.on("finish", () => {
          api.sendMessage(
            { attachment: fs.createReadStream(mp3Path) },
            event.threadID,
            () => fs.unlinkSync(mp3Path),
            event.messageID
          );
        });

        writer.on("error", () => {
          api.sendMessage("❌ Error downloading MP3.", event.threadID, event.messageID);
        });
      }, event.messageID);

    } catch (err) {
      console.error("❌ Spotify Error:", err.message);
      api.sendMessage("❌ Something went wrong while fetching the song.", event.threadID, event.messageID);
    }
  }
};
