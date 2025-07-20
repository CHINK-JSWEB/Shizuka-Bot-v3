const axios = require("axios");

module.exports = {
  config: {
    name: "ytdl",
    version: "1.0",
    author: "Nikox",
    role: 0,
    shortDescription: "Download YouTube video",
    category: "media",
    guide: "{pn} <youtube link>"
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];
    if (!url) return api.sendMessage("❌ Please provide a YouTube URL.", event.threadID);

    try {
      const res = await axios.get(`https://haji-mix-api.gleeze.com/api/ytdl?url=${encodeURIComponent(url)}&api_key=8672951c715e5945e70b9da2663e3bbc2a3e7c678738a094057e3117`);
      const data = res.data;

      if (!data || !data.result || !data.result.url)
        return api.sendMessage("❌ Failed to download the video.", event.threadID);

      api.sendMessage({
        body: `✅ Title: ${data.result.title}`,
        attachment: await global.utils.getStreamFromURL(data.result.url)
      }, event.threadID);
    } catch (e) {
      api.sendMessage("❌ Error: " + e.message, event.threadID);
    }
  }
};
