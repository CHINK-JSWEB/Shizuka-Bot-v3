const fs = require("fs");
const path = require("path");

module.exports = {
  name: "event",

  async execute({ api, event }) {
    if (event.logMessageType === "log:unsubscribe") {
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const gcName = threadInfo.threadName || "this group";
        const totalMembers = threadInfo.participantIDs.length;

        const leftUserID = event.logMessageData.leftParticipantFbId;
        const userInfo = await api.getUserInfo(leftUserID);
        const userName = userInfo[leftUserID]?.name || "Kaibigan";

        // 🕒 Date & time
        const dateTime = new Date().toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        // ⚰️ Funny random cause of leave
        const causes = [
          "Sawi sa pag-ibig 💔",
          "Napagod magmahal 😢",
          "Nawala sa signal 📶",
          "Iniwan ng tropa 😭",
          "Lumipad kasama si Darna 🪽",
          "Naubusan ng load 📵",
          "Nagsawa sa mga chismis ☕",
          "Tinawag ni admin sa langit 🕊️",
          "Nilamon ng lungkot 😔",
          "Nagtampo at nag-unfriend 😩"
        ];
        const randomCause = causes[Math.floor(Math.random() * causes.length)];

        console.log(`[💀] ${userName} left ${gcName} | Cause: ${randomCause}`);

        const mentions = [{ tag: `@${userName}`, id: leftUserID }];

        const messageBody = `
🪦⚰️ 𝗙𝗜𝗡𝗔𝗟 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗡𝗢𝗧𝗜𝗖𝗘 ⚰️🪦
───────────────────────────────
🕯️ 𝗥𝗲𝘀𝘁 𝗶𝗻 𝗣𝗲𝗮𝗰𝗲, ${userName} 🕯️
───────────────────────────────
@${userName} has departed from 𝗳𝗮𝗺𝗶𝗹𝘆 𝗴𝗿𝗼𝘂𝗽 **${gcName}** 💔  

📅 𝗗𝗮𝘁𝗲 & 𝗧𝗶𝗺𝗲: ${dateTime}
📉 𝗠𝗲𝗺𝗯𝗲𝗿𝘀 𝗟𝗲𝗳𝘁: ${totalMembers}
💬 𝗖𝗮𝘂𝘀𝗲 𝗼𝗳 𝗟𝗲𝗮𝘃𝗲: ${randomCause}

🕊️ 𝗚𝗼𝗻𝗲 𝗯𝘂𝘁 𝗻𝗼𝘁 𝗳𝗼𝗿𝗴𝗼𝘁𝘁𝗲𝗻...
"𝗠𝗮𝘆𝗯𝗲 𝘀𝗼𝗺𝗲𝗱𝗮𝘆... 𝘁𝗵𝗲𝘆’𝗹𝗹 𝗷𝗼𝗶𝗻 𝗮𝗴𝗮𝗶𝗻." 😢

───────────────────────────────
⚰️ 𝗟𝗮𝗽𝗶𝗱𝗮 𝗦𝗽𝗼𝗻𝘀𝗼𝗿𝗲𝗱 𝗯𝘆: 👑 𝗝𝗼𝗻𝗻𝗲𝗹 𝗦𝗼𝗿𝗶𝗮𝗻𝗼 👑
───────────────────────────────`;

        const gifPath = path.join(__dirname, "..", "assets", "goodbye.gif");
        const message = { body: messageBody, mentions };

        if (fs.existsSync(gifPath)) {
          message.attachment = fs.createReadStream(gifPath);
        }

        await api.sendMessage(message, event.threadID);
      } catch (err) {
        console.error("❌ Error in goodbye event:", err);
      }
    }
  },
};