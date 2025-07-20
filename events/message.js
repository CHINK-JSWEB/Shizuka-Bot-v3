// events/message.js
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "..", "echo-config.json");

module.exports = {
  name: "message",

  async execute({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    const commandWords = ["/echo", "echo", "!echo"];
    const lowerBody = body.toLowerCase().trim();
    if (commandWords.includes(lowerBody)) return; // Prevent re-echoing command

    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (err) {
        return; // Error reading config, skip
      }
    }

    // ✅ Only echo if explicitly enabled
    const threadEcho = config[threadID];
    if (!threadEcho || threadEcho.enabled !== true) return;

    return api.sendMessage(body, threadID);
  }
};
