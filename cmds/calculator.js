// cmds/calculator.js
const math = require("mathjs");

const lastCalculation = new Map();

module.exports = {
  config: {
    name: "calculator",
    aliases: ["calc", "compute"],
    version: "6.0",
    author: "Jonnel Soriano",
    role: 0,
    guide: {
      en: "calculator <expression>\nHalimbawa:\ncalc 5 + 3 * 2\ncalc (10 + 5) / 3\n\nPagkatapos ng result, pwede mong i-reply ng 'Explain' para malaman kung paano nakuha ang sagot."
    }
  },

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, body } = event;
    let expr = args.join(" ") || body.trim();

    // 🔹 Kapag nag-reply ng "Explain"
    if (/^explain$/i.test(expr)) {
      const prev = lastCalculation.get(threadID);
      if (!prev)
        return api.sendMessage(
          "🧠 | Wala pang naunang computation para i-explain boss.",
          threadID,
          messageID
        );

      try {
        const simplified = math.simplify(prev.expr).toString();
        const explanation = [
          "📘 EXPLANATION",
          "",
          `📥 Expression : ${prev.expr}`,
          `🧮 Simplified : ${simplified}`,
          `💡 Result : ${prev.result}`,
          "───────────────────────────────",
          "⚡ POWERED BY : Jonnel Soriano 💻"
        ].join("\n");

        const sent = await api.sendMessage(explanation, threadID, messageID);
        // 💬 React kapag explain
        api.setMessageReaction("💬", sent.messageID, () => {}, true);
        return;
      } catch {
        return api.sendMessage(
          "❌ | Hindi maipaliwanag ang expression na yan boss.",
          threadID,
          messageID
        );
      }
    }

    // ⚙️ Normal computation
    const first = expr.split(/\s+/)[0].toLowerCase();
    if (["calculator", "calc", "compute"].includes(first))
      expr = expr.split(/\s+/).slice(1).join(" ").trim();

    if (!expr)
      return api.sendMessage(
        "🧮 | Pakilagay ang expression mo.\nHalimbawa:\ncalc (5 + 3) * 2\ncompute 10 / 5",
        threadID,
        messageID
      );

    expr = expr.replace(/\^/g, "**");
    if (/[^0-9+\-*/%^().\s]/.test(expr))
      return api.sendMessage("❌ | May maling character sa expression mo.", threadID, messageID);

    if (expr.length > 100)
      return api.sendMessage("⚠️ | Medyo mahaba yan boss, paikliin mo 😅", threadID, messageID);

    try {
      const result = math.evaluate(expr);
      if (typeof result !== "number" || !isFinite(result))
        return api.sendMessage("⚠️ | Invalid or infinite result.", threadID, messageID);

      const formatted =
        Math.abs(result) > 1e12
          ? result.toExponential(6)
          : Math.round((result + Number.EPSILON) * 1e6) / 1e6;

      // 💾 Save last computation
      lastCalculation.set(threadID, { expr, result: formatted });
      setTimeout(() => lastCalculation.delete(threadID), 10 * 60 * 1000); // Auto-clear after 10 mins

      const message = [
        "🧮 SHIZUKA SMART CALCULATOR",
        "",
        `📥 Expression : ${expr}`,
        `💡 RESULT : ${formatted}`,
        "───────────────────────────────",
        "⚡ POWERED BY : Jonnel Soriano 💻",
        "",
        "💬 Tip: Reply 'Explain' para malaman ang proseso!"
      ].join("\n");

      const sent = await api.sendMessage(message, threadID, messageID);
      // 🧮 React kapag compute
      api.setMessageReaction("🧮", sent.messageID, () => {}, true);
    } catch {
      return api.sendMessage(
        "❌ | May error sa pag-compute.\nHalimbawa: calc (5 + 3) * 2",
        threadID,
        messageID
      );
    }
  }
};