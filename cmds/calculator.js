const axios = require("axios");
const math = require("mathjs"); // Make sure mathjs is installed

// Store last calculations per thread
const lastCalculations = {};

// Unicode Bold Labels
const poweredBy = "𝗝𝗢𝗡𝗡𝗘𝗟 𝗦𝗢𝗥𝗜𝗔𝗡𝗢"; // Bold Unicode
const expressionLabel = "📝 𝗘𝗫𝗣𝗥𝗘𝗦𝗦𝗜𝗢𝗡"; // Bold
const resultLabel = "💡 𝗥𝗘𝗦𝗨𝗟𝗧"; // Bold
const explanationLabel = "💬 𝗘𝗫𝗣𝗟𝗔𝗡𝗔𝗧𝗜𝗢𝗡"; // Bold

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

    // If user replies "Explain" to previous calculation
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

        const explanation = response.data.answer || "❌ Failed to get explanation.";

        return api.sendMessage(
`${expressionLabel}: ${expression}
${resultLabel}: ${result}
───────────────────────────────
${explanationLabel}:
${explanation}
───────────────────────────────
⚡ POWERED BY : ${poweredBy} 💻`,
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
`${expressionLabel}: ${body}
${resultLabel}: ${result}
───────────────────────────────
⚡ POWERED BY : ${poweredBy} 💻
💬 Tip: Reply 'Explain' para malaman ang proseso!`,
        threadID
      );

    } catch (err) {
      return api.sendMessage(`❌ Invalid expression: ${body}`, threadID);
    }
  }
};