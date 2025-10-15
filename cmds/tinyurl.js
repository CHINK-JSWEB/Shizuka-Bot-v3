const axios = require("axios");

module.exports = {
  config: {
    name: "tinyurl",
    version: "1.0",
    author: "Jonnel x Kaizenji",
    countDown: 5,
    role: 0,
    shortDescription: "Shorten a link",
    longDescription: "Gumawa ng maliit (short) URL gamit ang Kaiz API",
    category: "tools",
    guide: {
      en: "{pn} <link to shorten>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ").trim();

    if (!link) {
      return api.sendMessage("⚠️ Pakilagay ang link na gustong gawing short.\nHalimbawa: tinyurl https://example.com", threadID, messageID);
    }

    // Encode link properly
    const uploadParam = encodeURIComponent(link);
    const apiKey = "426510a2-63c7-4138-826b-6df7b87b676e";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/tinyurl?upload=${uploadParam}&apikey=${apiKey}`;

    const header = "🟢⚪🔴  🔗 𝐓𝐈𝐍𝐘𝐔𝐑𝐋 𝐁𝐘 𝐉𝐎𝐍𝐍𝐄𝐋 🔗  🟢⚪🔴";

    const waitMsg = await api.sendMessage(`${header}\n⏳ Ginagawa ang short link...`, threadID);

    try {
      const { data } = await axios.get(apiUrl);
      if (!data || !data.result) {
        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(`${header}\n❌ Hindi makuha ang short link.`, threadID);
      }

      const short = data.result;

      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

      const output = `${header}\n✅ Short link: ${short}\n\n🔗 Original: ${link}\n👑 Developer: 𝐉𝐨𝐧𝐧𝐞𝐥 𝐒𝐨𝐫𝐢𝐚𝐧𝐨`;

      return api.sendMessage(output, threadID);
    } catch (err) {
      console.error("TinyURL error:", err);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(`${header}\n⚠️ May error habang ginagawa ang short link.`, threadID);
    }
  }
};