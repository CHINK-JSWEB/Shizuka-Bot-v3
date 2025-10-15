const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mal",
    version: "2.1",
    author: "Jonnel x Kaizenji",
    countDown: 5,
    role: 0,
    shortDescription: "Search anime from MyAnimeList",
    longDescription: "Hanapin ang anime details gamit ang MyAnimeList API.",
    category: "anime",
    guide: {
      en: "{pn} <anime title>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "⚠️ Pakilagay ang anime title.\nHalimbawa: mal Naruto",
        event.threadID,
        event.messageID
      );
    }

    const waitMsg = await api.sendMessage(`🟢⚪🔴  🔍 𝐇𝐢𝐧𝐚𝐡𝐚𝐧𝐚𝐩 𝐚𝐧𝐠 𝐚𝐧𝐢𝐦𝐞 "${query}"...`, event.threadID);

    try {
      const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/mal", {
        params: {
          title: query,
          apikey: "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0"
        }
      });

      if (!data || !data.title) {
        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
        return api.sendMessage("❌ Walang nahanap na anime na tugma sa iyong hinanap.", event.threadID);
      }

      const {
        title,
        japanese,
        type,
        status,
        aired,
        episodes,
        duration,
        genres,
        popularity,
        ranked,
        score,
        rating,
        description,
        studios,
        producers,
        url,
        picture
      } = data;

      const info = `
🟢⚪🔴  🎬 𝐌𝐘𝐀𝐍𝐈𝐌𝐄𝐋𝐈𝐒𝐓 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒  🟢⚪🔴

📖 𝐓𝐢𝐭𝐥𝐞: ${title}
🈶 𝐉𝐚𝐩𝐚𝐧𝐞𝐬𝐞: ${japanese}
🎞️ 𝐓𝐲𝐩𝐞: ${type}
📺 𝐒𝐭𝐚𝐭𝐮𝐬: ${status}
📆 𝐀𝐢𝐫𝐞𝐝: ${aired}
📚 𝐄𝐩𝐢𝐬𝐨𝐝𝐞𝐬: ${episodes}
🕒 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${duration}
🎭 𝐆𝐞𝐧𝐫𝐞𝐬: ${genres}
🏢 𝐒𝐭𝐮𝐝𝐢𝐨𝐬: ${studios}
🎬 𝐏𝐫𝐨𝐝𝐮𝐜𝐞𝐫𝐬: ${producers}
⭐ 𝐒𝐜𝐨𝐫𝐞: ${score} (${ranked})
🔥 𝐏𝐨𝐩𝐮𝐥𝐚𝐫𝐢𝐭𝐲: ${popularity}
🔞 𝐑𝐚𝐭𝐢𝐧𝐠: ${rating}

📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧:
${description.length > 600 ? description.slice(0, 600) + "..." : description}

🔗 𝐌𝐨𝐫𝐞 𝐈𝐧𝐟𝐨: ${url}

👑 𝐀𝐏𝐈 𝐛𝐲 𝐊𝐚𝐢𝐳𝐞𝐧𝐣𝐢 | 𝐁𝐨𝐭 𝐛𝐲 𝐉𝐨𝐧𝐧𝐞𝐥
`;

      // 🖼️ Download poster
      const imagePath = path.join(__dirname, "../temp", `${Date.now()}_anime.jpg`);
      const img = await axios.get(picture, { responseType: "arraybuffer" });
      fs.outputFileSync(imagePath, Buffer.from(img.data, "binary"));

      await api.sendMessage(
        {
          body: info,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID
      );

      fs.unlinkSync(imagePath);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    } catch (err) {
      console.error("❌ MAL command error:", err);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      api.sendMessage("⚠️ May nangyaring error habang kumukuha ng data.", event.threadID);
    }
  }
};