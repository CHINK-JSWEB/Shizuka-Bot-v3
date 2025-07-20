const axios = require("axios");

module.exports = {
  config: {
    name: "gpt",
    version: "1.1",
    author: "Nikox",
    description: "Ask anything to GPT-4o (Kaiz API)",
    usage: "[tanong]",
    cooldowns: 3,
    commandCategory: "AI"
  },

  onStart: async function ({ api, event, args }) {
    const question = args.join(" ");
    if (!question) return api.sendMessage("❌ Magbigay ng tanong para gamitin ang GPT.", event.threadID);

    try {
      const url = `https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(question)}&uid=1&imageUrl=&apikey=4c92e1a3-4b13-4890-bff2-c494425a1d1d`;
      const res = await axios.get(url);

      const reply = res.data.response || "❌ Walang sagot mula sa GPT.";
      api.sendMessage(`🤖 GPT-4o AI:\n\n${reply}`, event.threadID, event.messageID);
    } catch (err) {
      console.error("GPT API Error:", err.message);
      api.sendMessage("❌ May naganap na error habang kinakausap si GPT.", event.threadID);
    }
  }
};
