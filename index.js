// index.js — Jonnelbot V2 by Jonnel Soriano
const fs = require("fs");
const path = require("path");
const express = require("express");
const login = require("ws3-fca");
const os = require("os");
const { execSync } = require("child_process");
const axios = require("axios");

// ================= EXPRESS SERVER =================
const app = express();
const PORT = process.env.PORT || 3000;

// Simple route
app.get("/", (_, res) => res.send("Bot is running!"));
app.get("/ping", (_, res) => res.send("pong"));

// Start Express server
app.listen(PORT, () => console.log(`🚀 Express server running on port ${PORT}`));

// 🔄 Auto-ping para manatiling online (every 4 minutes)
setInterval(() => {
  const url = `http://localhost:${PORT}/ping`;
  axios.get(url)
    .then(() => console.log("✅ Self-ping successful, bot stays alive"))
    .catch(err => console.error("❌ Self-ping failed:", err.message));
}, 4 * 60 * 1000);

// ================= SAFE REPLY HELPER =================
async function safeReply(api, threadID, messageID, text, attachment) {
  try {
    if (!threadID) {
      console.log("❌ ThreadID is missing, cannot send message.");
      return;
    }

    await api.sendMessage(
      {
        body: text,
        attachment: attachment ? fs.createReadStream(attachment) : undefined
      },
      threadID
    );

    console.log("✅ Message sent successfully to", threadID);

  } catch (err) {
    if (err.code === 1446034) {
      console.log("⚠️ Original content not available. Sending fallback message...");
      try {
        await api.sendMessage("⚠️ Sorry, hindi ma-reply ang original message.", threadID);
      } catch (innerErr) {
        console.error("❌ Fallback message failed:", innerErr);
      }
    } else {
      console.error("❌ Unexpected error in safeReply:", err);
    }
  }
}

// ================= GLOBAL VARIABLES =================
global.botStartTime = Date.now();
global.events = new Map();
global.commands = new Map();
const cooldowns = new Map();
const echoPath = path.join(__dirname, "echo-config.json");

// 🧠 System Info (Safe for Android/Termux)
const getSystemStats = () => {
  const cpus = os.cpus() || [];
  const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
  const coreCount = cpus.length || 1;
  const load = os.loadavg()[0] || 0;
  const cpuUsage = ((load / coreCount) * 100).toFixed(2);
  const totalMem = os.totalmem() || 1;
  const freeMem = os.freemem() || 0;
  const usedMem = totalMem - freeMem;

  let diskUsed = "N/A", diskTotal = "N/A", diskPercent = "N/A";
  try {
    const df = execSync("df -h /").toString().split("\n")[1].split(/\s+/);
    diskUsed = df[2] || "N/A";
    diskTotal = df[1] || "N/A";
    diskPercent = df[4] || "N/A";
  } catch {}

  return {
    cpuModel,
    cpuUsage,
    ram: {
      usedMB: (usedMem / 1024 / 1024).toFixed(1),
      totalMB: (totalMem / 1024 / 1024).toFixed(1),
      percent: ((usedMem / totalMem) * 100).toFixed(2)
    },
    disk: { used: diskUsed, total: diskTotal, percent: diskPercent }
  };
};
global.getSystemStats = getSystemStats;

// ================= LOAD CONFIG =================
const loadConfig = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing ${filePath}`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    console.error(`❌ Error loading ${filePath}:`, err);
    process.exit(1);
  }
};

const config = loadConfig("./config.json");
const appState = loadConfig("./appState.json");
const botPrefix = config.prefix || "!";
const detectedURLs = new Set();

// ================= LOAD EVENTS =================
const loadEvents = () => {
  try {
    const files = fs.readdirSync("./events").filter(f => f.endsWith(".js"));
    for (const file of files) {
      const event = require(`./events/${file}`);
      if (event?.config?.eventType && typeof event.run === "function") {
        for (const type of event.config.eventType) {
          if (!global.events.has(type)) global.events.set(type, []);
          global.events.get(type).push(event.run);
          console.log(`✅ Loaded event type: ${type}`);
        }
      }
      if (event?.name && typeof event.execute === "function") {
        const type = event.name;
        if (!global.events.has(type)) global.events.set(type, []);
        global.events.get(type).push(event.execute);
        console.log(`✅ Loaded legacy event: ${type}`);
      }
    }
  } catch (err) {
    console.error("❌ Error loading events:", err);
  }
};

// ================= LOAD COMMANDS =================
const getAllCommandFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllCommandFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".js")) {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
};

const loadCommands = () => {
  try {
    const commandFiles = getAllCommandFiles("./cmds");
    for (const file of commandFiles) {
      const cmd = require(path.resolve(file));
      const name = cmd.config?.name || cmd.name;
      const execute = cmd.execute || cmd.onStart;
      if (name && typeof execute === "function") {
        global.commands.set(name, {
          name,
          execute,
          cooldown: cmd.config?.countDown || 0,
          admin: cmd.config?.role === 1,
          usage: cmd.config?.guide?.en || '',
          version: cmd.config?.version || "1.0"
        });
        console.log(`✅ Loaded command: ${name}`);
      }
    }
  } catch (err) {
    console.error("❌ Error loading commands:", err);
  }
};

// ================= RESET ADMIN MODE =================
const adminFile = path.join(__dirname, "adminMode.json");
try {
  fs.writeFileSync(adminFile, JSON.stringify({ enabled: false }, null, 2));
  console.log("🔓 Admin-only mode reset to OFF on startup.");
} catch (err) {
  console.error("❌ Failed to write adminMode.json:", err);
}

// ================= START BOT =================
const startBot = () => {
  login({ appState }, async (err, api) => {
    if (err) return console.error("❌ Login failed:", err);

    try {
      api.setOptions({ ...config.option, listenEvents: true });
      console.clear();

      console.log(`
╔═════════════════════════════════════════════╗
║        🟢⚪🔴  JONNELBOT V2 ONLINE!          ║
║         🤖  AI SYSTEM ACTIVATED             ║
║      👨‍💻  Creator: Jonnel Soriano          ║
╚═════════════════════════════════════════════╝
      `);

      // 🔔 Bot startup info with fixed GIF
      const gifPath = path.join(__dirname, "assets", "indexprefix.gif");
      const botInfo = {
          body: `
🟢⚪🔴 *JONNELBOT V2 ONLINE* 🟢⚪🔴
🤖 AI SYSTEM ACTIVATED
👨‍💻 Creator: *Jonnel Soriano 👑*
━━━━━━━━━━━━━━━━━━━━━━
📌 Prefix: *${botPrefix}*
✨ Enjoy chatting!`,
          attachment: fs.existsSync(gifPath) ? fs.createReadStream(gifPath) : undefined
      };
      await safeReply(api, config.ownerID, null, botInfo.body, gifPath);

      // ==== LISTENER ====
      const botUID = api.getCurrentUserID();

      api.listenMqtt(async (err, event) => {
        if (err) return console.error("❌ Listener error:", err);
        if (!event || event.senderID === botUID) return;

        const threadID = event.threadID;
        const messageID = event.messageID;
        const text = event.body;

        // Example: automatic reply sa simpleng message
        if (text?.toLowerCase() === "hello") {
            await safeReply(api, threadID, messageID, "Hello! Ako si Shizuka, ang iyong bot.");
        }

        // Command handling
        if (text?.startsWith(botPrefix)) {
            const args = text.slice(botPrefix.length).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();
            const command = global.commands.get(commandName);
            if (command) {
                try {
                    await command.execute({ api, event, args, safeReply });
                } catch (cmdErr) {
                    console.error("❌ Command error:", cmdErr);
                    await safeReply(api, threadID, messageID, "⚠️ Error sa command execution.");
                }
            }
        }
      });

    } catch (err) {
      console.error("❌ Critical bot error:", err);
    }
  });
};

// ================= ERROR HANDLING =================
process.on("unhandledRejection", err => console.error("⚠️ Unhandled Rejection:", err));
process.on("uncaughtException", err => console.error("❌ Uncaught Exception:", err));

// ================= STATIC WEB PANEL =================
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

// ================= LAUNCH =================
loadEvents();
loadCommands();
startBot();