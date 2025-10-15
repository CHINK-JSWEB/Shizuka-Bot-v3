const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "qrcode",
    version: "1.0",
    author: "Jonnel x Kaizenji",
    countDown: 5,
    role: 0,
    shortDescription: "Generate QR code from text/link",
    longDescription: "Gumawa ng QR code image mula sa text o link gamit ang Kaiz API",
    category: "tools",
    guide: {
      en: "{pn} <text or link>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(" ").trim();

    if (!text) {
      return api.sendMessage(
        "⚠️ Pakilagay ang text o link para gawing QR code.\nHalimbawa: qrcode https://example.com",
        threadID,
        messageID
      );
    }

    const encoded = encodeURIComponent(text);
    const apiKey = "426510a2-63c7-4138-826b-6df7b87b676e";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/qrcode-generator?text=${encoded}&apikey=${apiKey}`;

    const header = "🟢⚪🔴  📷 𝐐𝐑 𝐂𝐎𝐃𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐎𝐑  📷  🟢⚪🔴";
    const waitMsg = await api.sendMessage(`${header}\n⏳ Ginagawa ang QR code...`, threadID);

    try {
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const imageData = response.data;

      const imagePath = path.join(__dirname, "../temp", `${Date.now()}_qrcode.png`);
      await fs.outputFile(imagePath, imageData);

      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

      const output = `${header}\n✅ QR code generated for:\n${text}`;
      await api.sendMessage(
        {
          body: output,
          attachment: fs.createReadStream(imagePath)
        },
        threadID
      );

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("QR Code generator error:", err);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(`${header}\n⚠️ May error habang ginagawa ang QR code.`, threadID);
    }
  }
};