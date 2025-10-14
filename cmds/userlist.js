const fs = require("fs-extra");

module.exports = {
  name: "userlist",
  description: "Show all users in the group (name + UID)",
  credits: "ArnelBot",
  hasPrefix: false, // change to true if you want to use prefix (like !userlist)
  cooldown: 3,

  async execute({ api, event }) {
    try {
      // get group information
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs || [];

      // build message
      let msg = `👥 User List for: ${threadInfo.threadName || "this group"}\n`;
      msg += `Total Members: ${members.length}\n\n`;

      // loop all participants and get name+UID
      for (const id of members) {
        let name = "";
        try {
          const userInfo = await api.getUserInfo(id);
          name = userInfo[id]?.name || "Unknown";
        } catch {
          name = "Unknown";
        }
        msg += `• ${name} (${id})\n`;
      }

      await api.sendMessage(msg, event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ Error in userlist command:", err);
      await api.sendMessage("⚠️ Unable to fetch user list.", event.threadID, event.messageID);
    }
  }
};
