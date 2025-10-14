const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "lyrics",
  version: "2.0",
  hasPrefix: false,
  description: "Search and get lyrics using Kaizenji API",
  usage: "lyrics <song name>",
  credits: "Jonnel x Kaizenji",

  async execute({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "❗ Usage: lyrics <song name>\n\nHalimbawa: lyrics Bakit Pa Ba",
          event.threadID,
          event.messageID
        );
      }

      const query = encodeURIComponent(args.join(" "));
      const apiKey = "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0";
      const apiUrl = `https://kaiz-apis.gleeze.com/api/lyrics?title=${query}&apikey=${apiKey}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.lyrics) {
        return api.sendMessage(
          "❌ Walang lyrics na nahanap para sa kantang iyan.",
          event.threadID,
          event.messageID
        );
      }

      // Download thumbnail if available
      let attachment = null;
      if (data.thumbnail) {
        try {
          const thumbPath = path.join(__dirname, "cache", "lyrics_thumb.jpg");
          const img = await axios.get(data.thumbnail, { responseType: "arraybuffer" });
          fs.writeFileSync(thumbPath, Buffer.from(img.data, "binary"));
          attachment = fs.createReadStream(thumbPath);
        } catch {
          attachment = null;
        }
      }

      const message = `🎶 *${data.title || "Unknown Title"}*\n\n${data.lyrics}\n\n📜 Lyrics fetched by Kaizenji API`;

      api.sendMessage(
        { body: message, attachment },
        event.threadID,
        () => {
          // cleanup temp image if downloaded
          if (attachment) fs.unlinkSync(path.join(__dirname, "cache", "lyrics_thumb.jpg"));
        },
        event.messageID
      );
    } catch (err) {
      console.error("[lyrics] Error:", err.message);
      api.sendMessage(
        "⚠️ Nagkaroon ng error habang kumukuha ng lyrics. Subukan ulit mamaya.",
        event.threadID,
        event.messageID
      );
    }
  },
};