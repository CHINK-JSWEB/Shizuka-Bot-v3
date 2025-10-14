const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "faceswap",
    version: "1.1",
    author: "Jonnel",
    description: "Face swap two images with style and branding",
    category: "fun",
    role: 0,
    hasPrefix: false,
    aliases: ["swap"]
  },

  async execute({ api, event }) {
    const header = `
🟢⚪🔴  🤖 𝗙𝗔𝗖𝗘 𝗦𝗪𝗔𝗣 𝗕𝗬 𝗝𝗢𝗡𝗡𝗘𝗟 🤖  🟢⚪🔴
`;

    try {
      if (!event.messageReply || event.messageReply.attachments.length !== 2) {
        return api.sendMessage(header + "\n❗ Please reply to a message with **exactly two images**.", event.threadID);
      }

      const [img1, img2] = event.messageReply.attachments;
      if (img1.type !== 'photo' || img2.type !== 'photo') {
        return api.sendMessage(header + "\n❗ Both attachments must be **images**.", event.threadID);
      }

      const baseUrl = encodeURIComponent(img1.url);
      const swapUrl = encodeURIComponent(img2.url);

      const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap?baseUrl=${baseUrl}&swapUrl=${swapUrl}&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`;

      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const cachePath = path.join(__dirname, "..", "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const imgPath = path.join(cachePath, `faceswap_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(res.data, 'binary'));

      return api.sendMessage({
        body: header + "\n✅ Face swapped successfully! Enjoy 😎",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID);
    } catch (err) {
      console.error("❌ FaceSwap Error:", err.message);
      return api.sendMessage("❌ Failed to swap faces. Try again later.", event.threadID);
    }
  }
};