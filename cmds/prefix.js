const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const configPath = "./config.json";
const config = JSON.parse(fs.readFileSync(configPath));

// Optional: override prefix
config.prefix = config.prefix || "help";

// Helper: safe disk info
function getDiskInfo() {
  try {
    // try df -h /
    const out = execSync("df -h /", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    const lines = out.trim().split("\n");
    if (lines.length >= 2) {
      // Example: Filesystem Size Used Avail Use% Mounted on
      const parts = lines[1].split(/\s+/);
      return {
        used: parts[2] || "N/A",
        total: parts[1] || "N/A",
        percent: parts[4] || "N/A"
      };
    }
  } catch (e) {
    // fallback: try df -h (maybe different output)
    try {
      const out2 = execSync("df -h", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
      const lines = out2.trim().split("\n");
      if (lines.length >= 2) {
        const parts = lines[1].split(/\s+/);
        return {
          used: parts[2] || "N/A",
          total: parts[1] || "N/A",
          percent: parts[4] || "N/A"
        };
      }
    } catch (e2) {
      return { used: "N/A", total: "N/A", percent: "N/A" };
    }
  }
  return { used: "N/A", total: "N/A", percent: "N/A" };
}

// Helper: convert bytes -> MB with 1 decimal
function toMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

module.exports = {
    name: "prefix",
    usePrefix: false,
    usage: "prefix",
    version: "2.6",
    description: "Displays the bot's prefix with a fixed GIF and system stats.",
    cooldown: 5,
    admin: false,

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;
        const botPrefix = config.prefix;
        const botName = config.botName || "Shizuka";

        // 🎯 Fixed GIF
        const gifPath = path.join(__dirname, "../assets/prefix.gif");

        if (!fs.existsSync(gifPath)) {
            return api.sendMessage("⚠️ GIF not found: assets/prefix.gif", threadID, messageID);
        }

        // --- System stats ---
        const cpus = os.cpus() || [];
        const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
        const coreCount = cpus.length || 1;
        const load = os.loadavg ? os.loadavg()[0] : 0;
        // estimate CPU usage percent from loadavg / cores (approx)
        const cpuUsagePercent = ((load / coreCount) * 100).toFixed(2);

        const totalMem = os.totalmem() || 0;
        const freeMem = os.freemem() || 0;
        const usedMem = totalMem - freeMem;
        const ramPercent = totalMem ? ((usedMem / totalMem) * 100).toFixed(2) : "N/A";

        const disk = getDiskInfo();

        // Unicode-bold labels (works visually on Messenger)
        const B = {
          HEADER: "💠 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 💠",
          BOT_NAME: "🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲",
          PREFIX: "📌 𝗣𝗿𝗲𝗳𝗶𝘅",
          VERSION: "🆔 𝗩𝗲𝗿𝘀𝗶𝗼𝗻",
          CPU: "🧠 𝗖𝗣𝗨",
          RAM: "💾 𝗥𝗔𝗠",
          DISK: "🗄️ 𝗗𝗶𝘀𝗸",
          DEVELOPER: "👨‍💻 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿"
        };

        // Build message body using Unicode-bold labels + readable values
        const messageBody = `
${B.HEADER}
────────────────────
${B.BOT_NAME}:  *${botName}*
${B.PREFIX}:  *${botPrefix}*
${B.VERSION}:  *${module.exports.version}*
────────────────────
${B.CPU}: ${cpuModel} (${coreCount} cores) — ${cpuUsagePercent}% load
${B.RAM}: ${toMB(usedMem)}MB / ${toMB(totalMem)}MB (${ramPercent}% used)
${B.DISK}: ${disk.used} / ${disk.total} (${disk.percent})
────────────────────
${B.DEVELOPER}:  𝗝𝗼𝗻𝗻𝗲𝗹 𝗦𝗼𝗿𝗶𝗮𝗻𝗼 👑  ( @Jonnel Soriano )
🖤 Made with love | All rights reserved © 2025
────────────────────
✨ Enjoy chatting!`;

        // Mentions: include the plain tag that appears in the message body so mention links
        const mentions = [{ tag: "@Jonnel Soriano", id: "100082770721408" }];

        const message = {
            body: messageBody,
            mentions,
            attachment: fs.createReadStream(gifPath)
        };

        try {
            await api.sendMessage(message, threadID);
        } catch (err) {
            console.error("❌ Failed to send prefix message:", err);
            api.sendMessage("⚠️ Failed to send message.", threadID, messageID);
        }
    },
};