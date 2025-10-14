const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "event",

  async execute({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const totalMembers = threadInfo.participantIDs.length;
        const botID = api.getCurrentUserID();
        const gcName = threadInfo.threadName || "this group";

        const newUsers = event.logMessageData.addedParticipants;
        for (const user of newUsers) {
          const userID = user.userFbId;
          const userName = user.fullName || "Kaibigan";

          // 📝 === Logger Section ===
          // Log to console
          console.log(`[JOIN] ${userName} (${userID}) joined ${gcName}`);

          // Save to a file (append mode)
          const logLine = `${new Date().toISOString()} - ${userName} (${userID}) joined ${gcName}\n`;
          fs.appendFileSync(path.join(__dirname, "..", "join-logs.txt"), logLine);

          // === End Logger Section ===

          const mentions = [
            { tag: `@${userName}`, id: userID },
            { tag: "@Jonnel Soriano", id: "100082770721408" }
          ];

          const message = {
            body:
`👋 Welcome home, @${userName}!

🏡 You’re now part of **${gcName}** — a family where laughter, support, and real connections thrive.

👑 Admin: @Jonnel Soriano
👥 Total Members: ${totalMembers}

💬 Feel free to be yourself.
We're happy to have you here! 💚`,
            mentions
          };

          const videoPath = path.join(__dirname, "..", "assets", "welcome.mp4");
          if (fs.existsSync(videoPath)) {
            message.attachment = fs.createReadStream(videoPath);
          }

          await api.sendMessage(message, event.threadID);

          if (userID === botID) {
            const newNickname = "Jonnel Bot Assistant 🤖";
            await api.changeNickname(newNickname, event.threadID, botID);
          }
        }
      } catch (err) {
        console.error("❌ Error in group event:", err);
      }
    }
  }
};
