const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  name: "nglspam",
  version: "1.3",
  hasPrefix: false,
  description: "📩 Magpadala ng spam message sa NGL gamit ang API.",
  usage: "nglspam <username> <message> <amount>",
  credits: "🤖 Jonnel Soriano",

  async execute({ api, event, args }) {
    if (args.length < 3) {
      return api.sendMessage(
        "❌ *Maling Format!*\n\n📌 *Tamang Gamit:*\nnglspam <username> <message> <amount>\n\n🧪 Halimbawa:\n`nglspam nikox24 kamusta ka 10`",
        event.threadID,
        event.messageID
      );
    }

    const username = args[0];
    const amount = parseInt(args[args.length - 1]);
    const question = args.slice(1, -1).join(" ");

    if (!username || !question || isNaN(amount)) {
      return api.sendMessage("⚠️ *Invalid input!*\n📍 Siguraduhing may tamang username, message, at bilang.", event.threadID, event.messageID);
    }

    try {
      const res = await axios.post("https://ngl-api-rdei.onrender.com/spam-ngl", {
        username,
        question,
        amount
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const now = moment().tz("Asia/Manila").format("YYYY-MM-DD hh:mm A");

      let reply = `✅ *NGL Spam Sent Successfully!*\n\n👤 Username: @${username}\n💬 Message: ${question}\n🔁 Repeats: ${amount}\n📅 Time: ${now}\n\n🛠️ API: RONALDRICH DUTERTE\n🤖 Bot Owner: Arnel Masibog`;

      if (res.data && typeof res.data === "string") {
        reply += `\n\n📩 Response: ${res.data}`;
      }

      return api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error("❌ NGL Spam Error:", error.message || error);
      return api.sendMessage("🚫 *Error sending spam!*\n❗ Subukan ulit mamaya o i-check ang username mo.", event.threadID, event.messageID);
    }
  }
};
