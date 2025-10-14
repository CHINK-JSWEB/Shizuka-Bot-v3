const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "info",
  version: "1.0.0",
  description: "Show bot and admin info with real uptime and random video",
  usage: "[info]",
  cooldown: 5,
  hasPermission: 0,
  credits: "Arnel",

  async execute({ api, event }) {
    const adminUID = "100082770721408";
    const adminName = "Jonnel files";
    const botName = "Jonnelbot 🌿";
    const botPrefix = "help";

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString("en-GB");

    // ✅ Accurate uptime using process.uptime()
    const uptimeSec = process.uptime();
    const days = Math.floor(uptimeSec / (60 * 60 * 24));
    const hours = Math.floor((uptimeSec / (60 * 60)) % 24);
    const minutes = Math.floor((uptimeSec / 60) % 60);
    const seconds = Math.floor(uptimeSec % 60);

    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // 🧠 RAM usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedMB = (usedMem / 1024 / 1024).toFixed(1);
    const totalMB = (totalMem / 1024 / 1024).toFixed(1);
    const percent = ((usedMem / totalMem) * 100).toFixed(1);

    // 📩 Build the message
    const msg = `✯ Bot Name: ${botName}
✯ Bot Admin:
${adminUID}
♛ Bot Admin Link:
https://www.facebook.com/${adminUID}
✪ Bot Prefix: ${botPrefix}
✯ Files Owner: ${adminName}

🕒 UPTIME: ${uptimeStr}
📆 Today: 『${dateStr}』【${timeStr}】

📦 RAM Usage: ${usedMB}MB / ${totalMB}MB (${percent}%)
✯ Thanks for using my bot`;

    // 🎞️ Optional random video
    const videoDir = path.join(__dirname, "..", "videos");
    if (fs.existsSync(videoDir)) {
      const videoFiles = fs.readdirSync(videoDir).filter(file => file.endsWith(".mp4"));
      if (videoFiles.length > 0) {
        const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];
        const videoPath = path.join(videoDir, randomVideo);
        const stream = fs.createReadStream(videoPath);

        return api.sendMessage({ body: msg, attachment: stream }, event.threadID, event.messageID);
      }
    }

    // 📨 If no video, send just the text
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
