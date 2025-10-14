const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "bgremove",
  version: "1.2",
  hasPrefix: false,
  description: "Remove background from an image using API",
  usage: "reply to an image with: bgremove",
  credits: "Jonnel",

  async execute({ api, event }) {
    const key = "66c17057-c78d-4d81-8581-eaf6d997f7a8";

    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("❌ Mag-reply sa isang larawan na gusto mong alisin ang background.", event.threadID, event.messageID);
    }

    const attachment = event.messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return api.sendMessage("❌ Ang file na ni-reply-an mo ay hindi isang larawan.", event.threadID, event.messageID);
    }

    const imageUrl = encodeURIComponent(attachment.url);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/removebgv2?url=${imageUrl}&apikey=${key}`;

    try {
      const start = Date.now();
      const response = await axios.get(apiUrl);
      const resultUrl = response.data.response;
      const ping = Date.now() - start;

      if (!resultUrl) throw new Error("Walang resultang larawan");

      // Ensure cache folder exists
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `nobg_${Date.now()}.png`);
      const img = await axios.get(resultUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(img.data, "binary"));

      const msgBody =
        "🟢⚪🔴 𝗕𝗚𝗥𝗘𝗠𝗢𝗩𝗘 🟢⚪🔴\n\n" +
        "✅ Tagumpay! Narito ang larawang wala nang background.\n" +
        "🔰 API: ZARK DEV ☣️\n" +
        "👑 Owner: Jonnel\n" +
        `⏱ Ping: ${ping}ms`;

      api.sendMessage({
        body: msgBody,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (err) {
      console.error("❌ BGRemove Error:", err);
      return api.sendMessage("❌ May nangyaring error habang inaayos ang larawan.", event.threadID, event.messageID);
    }
  }
};