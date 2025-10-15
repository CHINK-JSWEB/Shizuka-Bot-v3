const axios = require("axios");

module.exports = {
  config: {
    name: "uuidv4",
    version: "1.0",
    author: "Jonnel x Kaizenji",
    countDown: 5,
    role: 0,
    shortDescription: "Generate UUIDv4 codes",
    longDescription: "Gumagawa ng random UUIDv4 gamit ang Kaiz API",
    category: "tools",
    guide: {
      en: "{pn} [bilang ng UUIDs] (max 100)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const limit = parseInt(args[0]) || 10;

    if (limit < 1 || limit > 100) {
      return api.sendMessage("⚠️ Paki-set ng bilang mula 1 hanggang 100.", event.threadID, event.messageID);
    }

    const waitMsg = await api.sendMessage(`🟢⚪🔴  🔄 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 ${limit} 𝐔𝐔𝐈𝐃𝐬...`, event.threadID);

    try {
      const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/uuidv4", {
        params: {
          limit: limit,
          apikey: "426510a2-63c7-4138-826b-6df7b87b676e"
        }
      });

      if (!data || !data.uuids) {
        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
        return api.sendMessage("❌ Walang natanggap na UUIDs mula sa API.", event.threadID);
      }

      const uuidList = data.uuids.join("\n");

      const output = `
🟢⚪🔴  𝐔𝐔𝐈𝐃𝐯𝟒 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐎𝐑  🟢⚪🔴

📦 𝐁𝐢𝐥𝐚𝐧𝐠: ${data.uuids.length}
🧾 𝐀𝐮𝐭𝐡𝐨𝐫: ${data.author || "Kaizenji"}

━━━━━━━━━━━━━━━━━━━━━━━
${uuidList}
━━━━━━━━━━━━━━━━━━━━━━━

👑 𝐀𝐏𝐈 𝐛𝐲 𝐊𝐚𝐢𝐳𝐞𝐧𝐣𝐢 | 𝐁𝐨𝐭 𝐛𝐲 𝐉𝐨𝐧𝐧𝐞𝐥
`;

      await api.sendMessage(output, event.threadID);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    } catch (error) {
      console.error("UUIDv4 command error:", error);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      api.sendMessage("⚠️ May error habang kumukuha ng UUIDs.", event.threadID);
    }
  }
};