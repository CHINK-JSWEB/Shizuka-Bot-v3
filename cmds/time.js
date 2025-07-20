const moment = require("moment-timezone");

module.exports = {
    name: "time",
    usePrefix: false, // set to true if using command prefix
    usage: "time",
    version: "1.0",
    cooldown: 3,
    admin: false,

    execute: async ({ api, event }) => {
        try {
            const { threadID, messageID } = event;

            // You can change the timezone here (e.g., Asia/Manila)
            const currentTime = moment().tz("Asia/Manila");
            const timeString = currentTime.format("🕒 HH:mm:ss A");
            const dateString = currentTime.format("📅 MMMM D, YYYY");

            const response = `📌 Current Date & Time (PH):\n${dateString}\n${timeString}`;

            api.sendMessage(response, threadID, messageID);
        } catch (err) {
            console.error("❌ Error in time command:", err);
            api.sendMessage("⚠️ Failed to fetch time.", event.threadID, event.messageID);
        }
    }
};
