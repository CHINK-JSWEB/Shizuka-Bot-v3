module.exports = {
  name: "listbox",
  version: "1.0.0",
  description: "List all group chats with their admins and member count",
  usage: "[list all groups with admin(s)]",
  cooldown: 10,
  hasPermission: 2, // Only thread admins or bot owner
  credits: "Jonnel",

  async execute({ api, event }) {
    try {
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const groupList = threadList.filter(thread => thread.isGroup && thread.name != null);

      if (groupList.length === 0)
        return api.sendMessage("❌ No group chats found.", event.threadID, event.messageID);

      let msg = "📦 List of Group Chats with Admins and Member Count:\n\n";

      for (const thread of groupList) {
        const info = await api.getThreadInfo(thread.threadID);

        const adminIDs = info.adminIDs?.map(admin => admin.id) || [];
        const adminNames = info.userInfo
          .filter(user => adminIDs.includes(user.id))
          .map(user => user.name)
          .join(", ") || "Unknown";

        const memberCount = info.participantIDs?.length || 0;

        msg += `📌 Group: ${thread.name}\n🆔 ID: ${thread.threadID}\n👑 Admin(s): ${adminNames}\n👥 Members: ${memberCount}\n\n`;
      }

      return api.sendMessage(msg.trim(), event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ Error in listbox command:", err);
      return api.sendMessage("⚠️ An error occurred while listing groups.", event.threadID, event.messageID);
    }
  }
};
