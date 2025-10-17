const axios = require("axios");
const math = require("mathjs");

// Store last calculations per thread
const lastCalculations = {};

module.exports = {
  config: {
    name: "calculator",
    aliases: ["compute", "calc"],
    role: 0,
    guide: { en: "Usage: calculator 5+5 or calc 5*2" }
  },

  execute: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const body = args.join(" ").trim();

    if (!body) {
      return api.sendMessage("⚠️ Please provide an expression to calculate.", threadID);
    }

    // If user replies "Explain"
    if (body.toLowerCase() === "explain") {
      if (!lastCalculations[threadID]) {
        return api.sendMessage("⚠️ No previous calculation found. Please compute first.", threadID);
      }

      const { expression, result } = lastCalculations[threadID];

      try {
        const response = await axios.get("https://kaiz-apis.gleeze.com/api/kaiz-ai", {
          params: {
            ask: `Explain the computation result for: ${expression} = ${result}`,
            uid: 1,
            apikey: "fef2683d-2c7c-4346-a5fe-9e153bd9b7d0"
          }
        });

        const explanation = response.data.answer;

        return api.sendMessage(
`🧮 𝗦𝗛𝗜𝗭𝗨𝗞𝗔 𝗦𝗠𝗔𝗥𝗧 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥
📥 𝗘𝗫𝗣𝗥𝗘𝗦𝗦𝗜𝗢𝗡: ${expression}
💡 𝗥𝗘𝗦𝗨𝗟𝗧: ${result}
───────────────────────────────
💬 𝗘𝘅𝗽𝗹𝗮𝗻𝗮𝘁𝗶𝗼𝗻:
${explanation}
───────────────────────────────
⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 : 𝗝𝗢𝗡𝗡𝗘𝗟 𝗦𝗢𝗥𝗜𝗔𝗡𝗢 💻`,
          threadID
        );

      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to get explanation from AI.", threadID);
      }
    }

    // Normal calculation
    try {
      const result = math.evaluate(body);
      lastCalculations[threadID] = { expression: body, result };

      return api.sendMessage(
`🧮 𝗦𝗛𝗜𝗭𝗨𝗞𝗔 𝗦𝗠𝗔𝗥𝗧 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥
📥 𝗘𝗫𝗣𝗥𝗘𝗦𝗦𝗜𝗢𝗡: ${body}
💡 𝗥𝗘𝗦𝗨𝗟𝗧: ${result}
───────────────────────────────
⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 : 𝗝𝗢𝗡𝗡𝗘𝗟 𝗦𝗢𝗥𝗜𝗔𝗡𝗢 💻
💬 Tip: Reply 'Explain' para malaman ang proseso!`,
        threadID
      );

    } catch (err) {
      return api.sendMessage(`❌ Invalid expression: ${body}`, threadID);
    }
  }
};