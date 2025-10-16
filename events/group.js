const fs = require("fs");
const path = require("path");

module.exports = {
  name: "event",

  async execute({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const totalMembers = threadInfo.participantIDs.length;
        const botID = api.getCurrentUserID();
        const groupName = threadInfo.threadName || "this group";

        const newUsers = event.logMessageData.addedParticipants;
        const gifPath = path.join(__dirname, "../assets/welcome.gif");

        for (const user of newUsers) {
          const userID = user.userFbId;
          const userName = user.fullName || "there";

          const mentions = [
            { tag: `@${userName}`, id: userID },
            { tag: "@Jonnel", id: "100082770721408" }
          ];

          // Unicode Bold Text Helper
          const bold = (text) => text.replace(/[A-Za-z0-9]/g, (c) => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1D3BF);
            if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1D3B9);
            return c;
          });

          const messageBody = `
🟢⚪🔴  ${bold("WELCOME")}  🟢⚪🔴

👋 𝐇𝐞𝐥𝐥𝐨 ${bold(`@${userName}`)}! 🎉  
Welcome to ${bold(groupName)} 🌟

👥 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${totalMembers}  
We’re happy to have you here! 💬✨

👨‍💻 𝗔𝗱𝗺𝗶𝗻: ${bold("Jonnel Soriano")}  
Bot Creator: ${bold("Jonnel Soriano")} 🖤

Enjoy your stay and have fun! 🎊`;

          const message = {
            body: messageBody,
            mentions,
            attachment: fs.createReadStream(gifPath)
          };

          await api.sendMessage(message, event.threadID);

          // If bot itself is added, rename it
          if (userID === botID) {
            await api.changeNickname("Shizuka Bot v3", event.threadID, botID);
          }
        }
      } catch (err) {
        console.error("❌ Error in group event:", err);
      }
    }
  }
};