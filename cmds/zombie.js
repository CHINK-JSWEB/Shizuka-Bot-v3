const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "zombie",
    version: "1.0.0",
    author: "Jonnel Soriano 👑",
    countDown: 5,
    role: 0,
    shortDescription: "Turn an image into a zombie version 🧟‍♂️",
    longDescription: "Reply to an image to transform it into a creepy zombie style using the Kaiz API.",
    category: "fun",
    guide: {
      en: "Reply to an image with: zombie"
    }
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    // ✅ Check kung may image na ni-reply-an
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("⚠️ Please reply to an image to zombify it 🧟‍♂️", threadID, messageID);
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return api.sendMessage("⚠️ The replied message must be a photo!", threadID, messageID);
    }

    const imageUrl = encodeURIComponent(attachment.url);
    const apiKey = "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/zombie-v2?imageUrl=${imageUrl}&apikey=${apiKey}`;

    const tempPath = path.join(__dirname, "../cache/zombie_result.png");

    // 🕐 Send loading message
    api.sendMessage("🧟‍♂️ Creating zombie version... Please wait...", threadID, async (err, info) => {
      try {
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        await fs.ensureDir(path.dirname(tempPath));
        fs.writeFileSync(tempPath, response.data);

        // ✅ Send finished image
        api.sendMessage({
          body: `🧟‍♂️ *ZOMBIE TRANSFORMATION COMPLETE!*\n\n💀 You’ve been zombified!\n\n👑 Powered by Jonnel Soriano`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath));

      } catch (error) {
        console.error("❌ Zombie API Error:", error.message);
        api.sendMessage("⚠️ Failed to create zombie version. Please try again later.", threadID, messageID);
      }
    });
  }
};