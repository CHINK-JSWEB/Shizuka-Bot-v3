const axios = require("axios");

module.exports = {
  name: "lyrics",
  version: "1.0",
  hasPermission: false,
  credits: "Nikox",
  description: "Get song lyrics by title",
  commandCategory: "music",
  cooldowns: 3,
  usages: "[song title]",
  usePrefix: true,

  execute: async function ({ api, event, args }) {
    const title = args.join(" ");
    if (!title)
      return api.sendMessage("❌ | Please provide a song title.\n\nExample: lyrics Tibok", event.threadID, event.messageID);

    const url = `https://kaiz-apis.gleeze.com/api/lyrics?title=${encodeURIComponent(title)}&apikey=4c92e1a3-4b13-4890-bff2-c494425a1d1d`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (data.error || !data.lyrics)
        return api.sendMessage(`❌ | Lyrics not found for "${title}".`, event.threadID, event.messageID);

      const message = `🎵 Title: ${data.title}\n👤 Artist: ${data.artist}\n\n📜 Lyrics:\n${data.lyrics}`;
      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠️ | Failed to fetch lyrics. Try again later.", event.threadID, event.messageID);
    }
  }
};
