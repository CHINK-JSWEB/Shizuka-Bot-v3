const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "faceswap",
    version: "1.0",
    author: "Nikox",
    description: "Face swap two images",
    category: "fun",
    role: 0,
    hasPrefix: false,
    aliases: ["swap"]
  },

  async execute({ api, event }) {
    try {
      if (!event.messageReply || event.messageReply.attachments.length !== 2) {
        return api.sendMessage("❗ Please reply to a message with **exactly two images**.", event.threadID);
      }

      const [img1, img2] = event.messageReply.attachments;
      if (img1.type !== 'photo' || img2.type !== 'photo') {
        return api.sendMessage("❗ Both attachments must be **images**.", event.threadID);
      }

      const baseUrl = encodeURIComponent(img1.url);
      const swapUrl = encodeURIComponent(img2.url);

      const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap?baseUrl=${baseUrl}&swapUrl=${swapUrl}&apikey=4c92e1a3-4b13-4890-bff2-c494425a1d1d`;

      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const cachePath = path.join(__dirname, "..", "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const imgPath = path.join(cachePath, `faceswap_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(res.data, 'binary'));

      return api.sendMessage({
        body: "✅ Face swapped successfully!",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID);
    } catch (err) {
      console.error("❌ FaceSwap Error:", err.message);
      return api.sendMessage("❌ Failed to swap faces. Try again later.", event.threadID);
    }
  }
};
