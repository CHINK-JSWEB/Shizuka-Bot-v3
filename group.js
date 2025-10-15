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

                    // Dynamic, friendly welcome message
                    const messageBody = `
🔴⚪🟢🔴⚪🟢🔴⚪🟢
👋 *Hello @${userName}!* 🎉
Welcome to *${groupName}*! 🌟

👥 *Total Members:* ${totalMembers} 👀
We hope you have a great time chatting, sharing, and enjoying with everyone! 💬✨

👨‍💻 [ADMIN] *@Jonnel Soriano*: Feel free to ask questions anytime! 💻
Bot creator: *@Jonnel Soriano* 🖤

Enjoy your stay! 🎊
🔴⚪🟢🔴⚪🟢🔴⚪🟢`;

                    const message = {
                        body: messageBody,
                        mentions,
                        attachment: fs.createReadStream(gifPath)
                    };

                    await api.sendMessage(message, event.threadID);

                    // Change bot nickname if added
                    if (userID === botID) {
                        await api.changeNickname("Jonnelbot V2", event.threadID, botID);
                    }
                }
            } catch (err) {
                console.error("❌ Error in group event:", err);
            }
        }
    }
};