const axios = require("axios");

module.exports = {
  config: {
    name: "ytdl",
    version: "1.1",
    author: "Jonnel",
    role: 0,
    shortDescription: "Download YouTube video with preview",
    category: "media",
    guide: "{pn} <youtube link>"
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];
    if (!url) {
      return api.sendMessage(
        "❌ Please provide a YouTube URL.\n📌 Usage: ytdl <youtube link>",
        event.threadID
      );
    }

    try {
      const res = await axios.get(
        `https://haji-mix-api.gleeze.com/api/ytdl?url=${encodeURIComponent(
          url
        )}&api_key=8672951c715e5945e70b9da2663e3bbc2a3e7c678738a094057e3117`
      );
      const data = res.data;

      if (!data || !data.result || !data.result.url) {
        return api.sendMessage(
          "❌ Failed to download the video. Check the URL and try again.",
          event.threadID
        );
      }

      // Extract video info
      const title = data.result.title;
      const videoUrl = data.result.url;
      const videoId = url.split("v=")[1]?.split("&")[0];
      const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      // Design message body
      const caption = `🟢⚪🔴 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 🟢⚪🔴\n\n` +
                      `🎬 Title: ${title}\n` +
                      `👨‍💻 Creator: Jonnel Soriano\n` +
                      `📌 URL: ${url}\n` +
                      `━━━━━━━━━━━━━━\n` +
                      `✅ Click the attachment below to download your video!`;

      // Send message with thumbnail and attachment
      api.sendMessage(
        {
          body: caption,
          attachment: await global.utils.getStreamFromURL(videoUrl),
          image: await global.utils.getStreamFromURL(thumbnail)
        },
        event.threadID
      );

    } catch (e) {
      console.error("❌ YTDL Error:", e);
      api.sendMessage("❌ Error fetching YouTube video: " + e.message, event.threadID);
    }
  }
};