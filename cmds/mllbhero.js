const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mlbbhero",
    version: "2.0",
    author: "Jonnel x Kaizenji",
    countDown: 5,
    role: 0,
    shortDescription: "Mobile Legends hero info",
    longDescription: "Tingnan ang detalye ng MLBB hero gaya ng role, specialty, lane, at iba pa.",
    category: "games",
    guide: {
      en: "{pn} <hero name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage(
        "⚠️ Pakilagay ang hero name.\nHalimbawa: mlbbhero Zilong",
        event.threadID,
        event.messageID
      );
    }

    const waitMsg = await api.sendMessage(`🟢⚪🔴  🔍 𝐇𝐢𝐧𝐚𝐡𝐚𝐧𝐚𝐩 𝐚𝐧𝐠 𝐡𝐞𝐫𝐨 "${name}"...`, event.threadID);

    try {
      const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/mlbb-heroes", {
        params: {
          name: name,
          apikey: "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0"
        }
      });

      if (!data || !data.response || !data.response.heroName) {
        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
        return api.sendMessage("❌ Walang nahanap na hero na tugma sa iyong hinanap.", event.threadID);
      }

      const h = data.response;

      const info = `
🟢⚪🔴  ⚔️ 𝐌𝐎𝐁𝐈𝐋𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒 𝐇𝐄𝐑𝐎 𝐈𝐍𝐅𝐎 ⚔️  🟢⚪🔴

🧿 𝐍𝐚𝐦𝐞: ${h.heroName}
🏷️ 𝐀𝐥𝐢𝐚𝐬: ${h.alias}
🈶 𝐈𝐧𝐭𝐞𝐫𝐧𝐚𝐥 𝐍𝐚𝐦𝐞: ${h.internalName}
🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲: ${h.birthday}
🏠 𝐁𝐨𝐫𝐧 𝐢𝐧: ${h.born}
🚹 𝐆𝐞𝐧𝐝𝐞𝐫: ${h.gender}
🧬 𝐒𝐩𝐞𝐜𝐢𝐞𝐬: ${h.species}
⚔️ 𝐑𝐨𝐥𝐞: ${h.role}
🎯 𝐒𝐩𝐞𝐜𝐢𝐚𝐥𝐭𝐲: ${h.specialty}
🛣️ 𝐋𝐚𝐧𝐞 𝐑𝐞𝐜𝐨𝐦𝐦𝐞𝐧𝐝: ${h.laneRecommend}
💰 𝐏𝐫𝐢𝐜𝐞: ${h.price}
🔋 𝐒𝐤𝐢𝐥𝐥 𝐑𝐞𝐬𝐨𝐮𝐫𝐜𝐞: ${h.skillResource}
💥 𝐃𝐚𝐦𝐚𝐠𝐞 𝐓𝐲𝐩𝐞: ${h.damageType}
⚔️ 𝐁𝐚𝐬𝐢𝐜 𝐀𝐭𝐭𝐚𝐜𝐤: ${h.basicAttackType}

📊 𝐒𝐓𝐀𝐓𝐒:
🛡️ Durability: ${h.durability}/10
⚔️ Offense: ${h.offense}/10
🎯 Control Effects: ${h.controlEffects}/10
🧠 Difficulty: ${h.difficulty}/10

📅 𝐑𝐞𝐥𝐞𝐚𝐬𝐞 𝐃𝐚𝐭𝐞: ${h.releaseDate}
🪶 𝐀𝐟𝐟𝐢𝐥𝐢𝐚𝐭𝐢𝐨𝐧: ${h.affiliation}
🔱 𝐖𝐞𝐚𝐩𝐨𝐧𝐬: ${h.weapons}
⚡ 𝐀𝐛𝐢𝐥𝐢𝐭𝐢𝐞𝐬: ${h.abilities}

👑 𝐀𝐏𝐈 𝐛𝐲 𝐊𝐚𝐢𝐳𝐞𝐧𝐣𝐢 | 𝐁𝐨𝐭 𝐛𝐲 𝐉𝐨𝐧𝐧𝐞𝐥
`;

      const imagePath = path.join(__dirname, "../temp", `${Date.now()}_hero.png`);
      const img = await axios.get(h.thumbnail, { responseType: "arraybuffer" });
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
      console.error("❌ MLBB Hero command error:", err);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      api.sendMessage("⚠️ May nangyaring error habang kumukuha ng data.", event.threadID);
    }
  }
};