const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sim",
    version: "6.2",
    author: "Nikox",
    description: "Auto insults user and learns new phrases directly through chat",
    category: "chat",
    role: 0,
    usePrefix: false,
  },

  onStart: async () => {},

  execute: async ({ api, event }) => {
    const brainPath = path.join(__dirname, "..", "brain.json");

    let brain = {};
    try {
      brain = JSON.parse(fs.readFileSync(brainPath, "utf8"));
    } catch {
      brain = {};
    }

    const text = event.body?.toLowerCase().trim();
    if (!text || text.length < 2) return;

    // 🧠 Manual teach support
    if (text.startsWith("sim teach ")) {
      const parts = text.replace("sim teach ", "").split("/");
      if (parts.length !== 2) {
        return api.sendMessage("❌ Invalid format. Use:\nsim teach <question>/<reply>", event.threadID, event.messageID);
      }
      const [question, answer] = parts.map(x => x.trim());
      if (!question || !answer) {
        return api.sendMessage("⚠️ Invalid input. Both question and reply must be non-empty.", event.threadID, event.messageID);
      }

      brain[question.toLowerCase()] = answer;
      try {
        fs.writeFileSync(brainPath, JSON.stringify(brain, null, 2), "utf8");
        return api.sendMessage(`✅ Na-save:\n"${question}" → "${answer}"`, event.threadID, event.messageID);
      } catch (err) {
        console.error("❌ Save failed:", err);
        return api.sendMessage("⚠️ Di ko masave utak ko 😭", event.threadID, event.messageID);
      }
    }

    // 🧠 Search brain for matching phrase or word
    const replies = new Set();

    for (const key in brain) {
      if (text.includes(key.toLowerCase())) {
        replies.add(brain[key]);
      }
    }

    const words = text.split(/\s+/);
    for (const word of words) {
      for (const key in brain) {
        if (word === key.toLowerCase()) {
          replies.add(brain[key]);
        }
      }
    }

    if (replies.size > 0) {
      return api.sendMessage([...replies].join("\n\n"), event.threadID, event.messageID);
    }

    // 🧠 No match — insult only, don't save
    const insultReplies = [
      "Ikaw nga eh, kulang sa pansin tapos nagtataka ka.",
      "Tinitira mo sarili mo? Kasi ikaw target ng sagot ko. 😂",
      "Oo ikaw 'yan. Huwag ka na magtago.",
      "Wala kang ambag pero ang lakas mong magsalita.",
      "Hindi ka pa nagsisimula, pero sawang-sawa na ako sayo.",
      "Bakit parang ikaw ang problema sa tanong mo?",
      "Ang confident mo ha, sa mukha mong 'yan?",
      "Ang lakas ng loob mo ah, kahit obvious na wala ka roon.",
      "Ikaw yung tipo ng tanong na wala namang sagot.",
      "Parang ikaw lang 'to eh, pasok na pasok sa description."
    ];

    const chosen = insultReplies[Math.floor(Math.random() * insultReplies.length)];
    return api.sendMessage(chosen, event.threadID, event.messageID);
  }
};
