let spamIntervals = {};

module.exports = {
  name: "spam",
  version: "1.2",
  usePrefix: false,
  description: "Toggle spam messages with 'on' and 'off'",
  usage: "spam on [message] / spam off",

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const key = `${threadID}:${senderID}`;

    if (!args.length || (args[0] !== "on" && args[0] !== "off")) {
      return api.sendMessage("❗ Usage:\n- spam on [message]\n- spam off", threadID, messageID);
    }

    const action = args[0].toLowerCase();

    if (action === "off") {
      if (spamIntervals[key]) {
        clearInterval(spamIntervals[key]);
        delete spamIntervals[key];
        return api.sendMessage("🛑 Spam stopped successfully.", threadID, messageID);
      } else {
        return api.sendMessage("⚠️ Spam is not running.", threadID, messageID);
      }
    }

    if (action === "on") {
      if (spamIntervals[key]) {
        return api.sendMessage("⚠️ Spam is already running. Use 'spam off' to stop.", threadID, messageID);
      }

      const message = args.slice(1).join(" ");
      if (!message) {
        return api.sendMessage("❗ Please provide a message to spam.\nUsage: spam on [message]", threadID, messageID);
      }

      const interval = setInterval(() => {
        api.sendMessage(message, threadID);
      }, 1000); // 1 second delay

      spamIntervals[key] = interval;
      return api.sendMessage("✅ Spam started. Use 'spam off' to stop.", threadID, messageID);
    }
  }
};
