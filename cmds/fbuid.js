const axios = require("axios");

module.exports = {
  name: "fbuid",
  version: "2.1",
  hasPrefix: false,
  description: "Kumuha ng Facebook UID gamit ang link (no API required)",
  usage: "fbuid <facebook link>",
  credits: "Jonnel UID (scraper)",

  async execute({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const link = args.join(" ").trim();

    if (!link)
      return api.sendMessage(
        "⚠️ Pakilagay ang Facebook link.\nHalimbawa:\nfbuid https://facebook.com/zuck",
        threadID,
        messageID
      );

    // Brand header
    const header = "🟢⚪🔴  🤖 𝗙𝗕 𝗨𝗜𝗗 𝗕𝗬 𝗝𝗢𝗡𝗡𝗘𝗟 🤖  🟢⚪🔴\n";
    const loadingMsg = await message(header + "⏳ Kinukuha ang UID, sandali lang...", threadID);

    try {
      const { data } = await axios.get(link, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
        },
      });

      // Hanapin ang UID sa HTML
      const match =
        data.match(/"entity_id":"(\d+)"/) ||
        data.match(/"userID":"(\d+)"/) ||
        data.match(/fb:\/\/profile\/(\d+)/);

      if (match && match[1]) {
        const uid = match[1];

        // Delete loading message after success
        if (loadingMsg?.messageID) setTimeout(() => api.unsendMessage(loadingMsg.messageID), 5000);

        return api.sendMessage(
          header +
            `✅ UID nakuha!\n\n🔹 Link: ${link}\n🆔 UID: ${uid}\n\n👑 Owner: Jonnel`,
          threadID
        );
      } else {
        if (loadingMsg?.messageID) api.unsendMessage(loadingMsg.messageID);

        return api.sendMessage(
          header + "❌ Hindi makita ang UID sa page. Siguraduhing public ang link at subukan ulit.",
          threadID
        );
      }
    } catch (err) {
      console.error("❌ FBUID Error:", err.message);

      if (loadingMsg?.messageID) api.unsendMessage(loadingMsg.messageID);

      return api.sendMessage(
        header + "⚠️ Nagka-error habang kinukuha ang UID. Pakisubukan ulit mamaya.",
        threadID
      );
    }
  },
};