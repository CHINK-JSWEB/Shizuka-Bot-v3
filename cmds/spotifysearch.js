// cmds/spotifysearch.js
const axios = require("axios");

module.exports = {
  name: "spotifysearch",
  version: "1.1",
  description: "Search Spotify tracks with style",
  guide: "spotifysearch <song name>",
  category: "music",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args || args.length === 0) {
      return api.sendMessage("❌ Please provide a song name. Usage: spotifysearch <song name>", threadID);
    }

    const query = args.join(" ");
    const apikey = "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0";
    const url = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${encodeURIComponent(query)}&apikey=${apikey}`;

    try {
      // React to original message with ⌛ while searching
      await api.setMessageReaction("⌛", messageID, (err) => { if(err) console.log(err); });

      // Send searching message
      const searchingMsg = await api.sendMessage(`🔍 Searching music 🎶\nPlease wait a moment...`, threadID);

      const res = await axios.get(url);
      const tracks = res.data;

      // Remove ⌛ react & add ✅
      await api.setMessageReaction("✅", messageID, (err) => { if(err) console.log(err); });

      if (!tracks || tracks.length === 0) {
        return api.sendMessage(`❌ No results found for "${query}"`, threadID);
      }

      // Build message with design
      let msg = `🟢⚪🔴 SPOTIFY SONG 🔴⚪🟢\nSearch Results for "${query}"\n─────────────────────────────\n`;

      tracks.slice(0, 5).forEach((track, i) => {
        msg += `${i + 1}. ${track.title} 🎶\n`;
        msg += `👤 Author: ${track.author}\n`;
        msg += `⏱ Duration: ${track.duration}\n`;
        msg += `📅 Release Date: ${track.release_date}\n`;
        msg += `🔗 Spotify Link: ${track.trackUrl}\n`;
        msg += `🖼 Thumbnail: ${track.thumbnail}\n─────────────────────────────\n`;
      });

      msg += `Enjoy listening! 🎧\n\n__________________________\nPowered by : Jonnel Soriano 👑`;

      // Send final message
      await api.sendMessage(msg, threadID);

      // Optional: Delete searching message
      await api.unsendMessage(searchingMsg.messageID);

    } catch (err) {
      console.error("Spotify search error:", err.message);
      return api.sendMessage("❌ Error fetching Spotify results. Try again later.", threadID);
    }
  }
};