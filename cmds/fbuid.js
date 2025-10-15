const axios = require("axios");

module.exports = {
  config: {
    name: "fbuid",
    version: "3.1",
    author: "Jonnel Soriano 👑",
    role: 0,
    countDown: 5,
    shortDescription: "Kumuha ng Facebook UID gamit ang kahit anong link 🆔",
    longDescription: "Gamitin para makuha ang UID ng isang Facebook link gamit ang Kaiz API.",
    category: "tools",
    guide: {
      en: "fbuid <facebook link>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const link = args.join(" ").trim();

    if (!link)
      return api.sendMessage(
        "⚠️ Pakilagay ang Facebook link.\nHalimbawa:\nfbuid https://facebook.com/zuck",
        threadID,
        messageID
      );

    const apiKey = "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/fbuid?url=${encodeURIComponent(link)}&apikey=${apiKey}`;

    // 🟢 Header
    const header = "🟢⚪🔴  🤖 𝗙𝗕 𝗨𝗜𝗗 𝗕𝗬 𝗝𝗢𝗡𝗡𝗘𝗟 🤖  🟢⚪🔴\n";

    const loading = await message(`${header}\n⏳ Kinukuha ang UID...`, threadID);

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.result || !data.result.uid) {
        if (loading?.messageID) api.unsendMessage(loading.messageID);
        return api.sendMessage(
          `${header}\n❌ Hindi makita ang UID.\nSiguraduhing public o valid ang link.`,
          threadID
        );
      }

      const uid = data.result.uid;
      const type = data.result.type || "Unknown";
      const name = data.result.name || "Unknown User";
      const timePH = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });

      // ✅ Delete loading message after success
      if (loading?.messageID) api.unsendMessage(loading.messageID);

      const output = `${header}
✅ 𝗨𝗜𝗗 𝗡𝗔𝗞𝗨𝗛𝗔!

🔹 𝗣𝗮𝗻𝗴𝗮𝗹𝗮𝗻: ${name}
🔹 𝗟𝗶𝗻𝗸: ${link}
🆔 𝗨𝗜𝗗: ${uid}
📦 𝗧𝘆𝗽𝗲: ${type}

👑 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: 𝗝𝗼𝗻𝗻𝗲𝗹 𝗦𝗼𝗿𝗶𝗮𝗻𝗼
🕒 𝗗𝗮𝘁𝗲 & 𝗧𝗶𝗺𝗲: ${timePH}`;

      return api.sendMessage(output, threadID);
    } catch (err) {
      console.error("❌ FBUID Error:", err.message);

      if (loading?.messageID) api.unsendMessage(loading.messageID);

      return api.sendMessage(
        `${header}\n⚠️ Nagka-error habang kinukuha ang UID.\nSubukan ulit mamaya.`,
        threadID
      );
    }
  }
};