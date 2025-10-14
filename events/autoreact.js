const fs = require("fs-extra");
const path = require("path");
const configPath = path.join(__dirname, "..", "database", "autoreact.json");

module.exports = {
  name: "message",
  async execute({ api, event, args, config }) {
    if (event.senderID == api.getCurrentUserID()) return;

    // Skip reacting to messages starting with prefix (commands)
    const prefix = config.PREFIX || ".";
    if (event.body?.startsWith(prefix)) return;

    // Read config file
    if (!fs.existsSync(configPath)) return;
    const reactConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // If threadID not enabled, skip
    if (!reactConfig[event.threadID]) return;

    try {
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];
      const chosen = reactions[Math.floor(Math.random() * reactions.length)];
      await api.setMessageReaction(chosen, event.messageID, () => {}, true);
    } catch (err) {
      console.error("AutoReact error:", err);
    }
  }
};
