const fs = require("fs-extra");
const path = require("path");
const configPath = path.join(__dirname, "..", "antiout-config.json");

module.exports = {
  name: "event",

  async execute({ api, event }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    // Load config to check if anti-out is enabled
    let config = { enabled: false };
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    if (!config.enabled) return; // 🔒 Respect OFF toggle

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const leftUserID = event.logMessageData.leftParticipantFbId;
      const botID = api.getCurrentUserID();

      if (leftUserID === botID) return;

      await api.addUserToGroup(leftUserID, event.threadID);

      const userInfo = await api.getUserInfo(leftUserID);
      const userName = userInfo[leftUserID]?.name || "Kaibigan";

      const msg = {
        body: `🚨 *Bawal ang mag-leave!*  
🔁 Ibinalik si ${userName} sa group.  
🤖 Loyalka Anti-Out protection is ON.`,
        mentions: [{ tag: userName, id: leftUserID }]
      };

      await api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error("❌ Anti-out error:", err);
    }
  }
};
