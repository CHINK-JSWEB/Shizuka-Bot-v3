const fs = require("fs");
const path = require("path");

module.exports = {
  name: "log:unsubscribe",

  async execute({ api, event }) {
    try {
      const botID = api.getCurrentUserID();
      const leftID = event.logMessageData?.leftParticipantFbId;

      // Ignore if bot left
      if (!leftID || leftID === botID) return;

      // Get user info
      const userInfo = await api.getUserInfo(leftID);
      const userName = userInfo[leftID]?.name || "someone";

      // Get group info
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "this group";

      // Goodbye message choices
      const messages = [
        `👋 Paalam, ${userName}!`,
        `📤 ${userName} has left ${groupName}.`,
        `😢 ${userName} left the chat.`,
        `🚪 ${userName} walked out.`,
        `🫡 Salute, ${userName}! Hanggang sa muli.`
      ];

      const goodbyeMessage = messages[Math.floor(Math.random() * messages.length)];

      // Look for media attachment
      const mediaFolder = path.join(__dirname, "../media");
      let attachment = null;

      if (fs.existsSync(mediaFolder)) {
        const files = fs.readdirSync(mediaFolder).filter(file =>
          /^goodbye.*\.(mp4|mov|webm|gif|jpg|png)$/i.test(file)
        );

        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          attachment = fs.createReadStream(path.join(mediaFolder, randomFile));
        }
      }

      // Send goodbye message
      await api.sendMessage({
        body: goodbyeMessage,
        attachment: attachment || undefined
      }, event.threadID);

    } catch (err) {
      console.error("❌ Error in goodbye event:", err);
    }
  }
};
