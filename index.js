// index.js — Shizuka Bot V2 by Jonnel Soriano

const fs = require("fs");
const path = require("path");
const express = require("express");
const login = require("ws3-fca");
const os = require("os");
const { execSync } = require("child_process");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

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
          cooldown: cmd.config?.countDown || 5,
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

// 🔐 Reset admin-only on startup
const adminFile = path.join(__dirname, "adminMode.json");
try {
  fs.writeFileSync(adminFile, JSON.stringify({ enabled: false }, null, 2));
  console.log("🔓 Admin-only mode reset to OFF on startup.");
} catch (err) {
  console.error("❌ Failed to write adminMode.json:", err);
}

// ================= EXPRESS & SELF-PING =================
app.get("/", (_, res) => res.send("Bot is running!"));
app.get("/ping", (_, res) => res.send("pong"));
app.listen(PORT, () => console.log(`🚀 Express server running on port ${PORT}`));
setInterval(() => {
  axios.get(`http://localhost:${PORT}/ping`).catch(() => {});
}, 4 * 60 * 1000);

// ================= START BOT =================
const startBot = () => {
  if (global.botRunning) {
    console.log("⚠️ Bot already running, skipping new login...");
    return;
  }
  global.botRunning = true;

  login({ appState }, async (err, api) => {
    if (err) return console.error("❌ Login failed:", err);

    try {
      api.setOptions({ ...config.option, listenEvents: true });
      console.clear();

      // Startup Message
      const startupMessage = `
🟢⚪🔴 𝗦𝗛𝗜𝗭𝗨𝗞𝗔 𝗜𝗦 𝗢𝗡𝗟𝗜𝗡𝗘 🟢⚪🔴
🤖 𝗔𝗜 𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗
👨‍💻 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: 𝗝𝗼𝗻𝗻𝗲𝗹 𝗦𝗼𝗿𝗶𝗮𝗻𝗼 👑
━━━━━━━━━━━━━━━━━━━━━━
📌 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}
✨ 𝗘𝗻𝗷𝗼𝘆 𝗰𝗵𝗮𝘁𝘁𝗶𝗻𝗴!
      `;
      const gifPath = path.join(__dirname, "assets", "indexprefix.gif");
      await api.sendMessage(
        { body: startupMessage, attachment: fs.existsSync(gifPath) ? fs.createReadStream(gifPath) : undefined },
        config.ownerID
      );

      const botUID = api.getCurrentUserID();

      // 🧩 Prevent multiple listeners
      if (global.listenActive) {
        console.log("⚠️ Listener already active, skipping duplicate setup.");
        return;
      }
      global.listenActive = true;
      global.processedMessages = new Set();

      api.listenMqtt(async (err, event) => {
        try {
          if (err) return console.error("❌ Listener error:", err);
          if (!event || event.senderID === botUID) return;

          // ✅ Ignore duplicate messages EXCEPT message_unsend
          if (event.type !== "message_unsend") {
            const mid = event.messageID || `${event.timestamp}-${event.threadID}`;
            if (global.processedMessages.has(mid)) return;
            global.processedMessages.add(mid);
            setTimeout(() => global.processedMessages.delete(mid), 30000);
          }

          // 🔁 Run event handlers
          const handlers = global.events.get(event.type);
          if (Array.isArray(handlers)) {
            for (const handler of handlers) {
              try { await handler({ api, event }); } catch (e) { console.error(e); }
            }
          }

          // 🌐 URL detection
          const urlRegex = /(https?:\/\/[^\s]+)/gi;
          if (event.body && urlRegex.test(event.body)) {
            const urlCmd = global.commands.get("url");
            if (urlCmd) {
              const detectedURL = event.body.match(urlRegex)[0];
              const key = `${event.threadID}-${detectedURL}`;
              if (!detectedURLs.has(key)) {
                detectedURLs.add(key);
                try { await urlCmd.execute({ api, event }); } catch (e) { console.error(e); }
                setTimeout(() => detectedURLs.delete(key), 3600000);
              }
            }
          }

          // 💬 Command execution with cooldown
          if (event.body) {
            let args = event.body.trim().split(/ +/);
            let commandName = args.shift().toLowerCase();
            let command = global.commands.get(commandName);

            if (!command && event.body.startsWith(botPrefix)) {
              commandName = event.body.slice(botPrefix.length).split(/ +/).shift().toLowerCase();
              command = global.commands.get(commandName);
            }

            if (command) {
              const userCooldowns = cooldowns.get(command.name) || new Map();
              const now = Date.now();
              const cdTime = command.cooldown * 1000;

              if (userCooldowns.has(event.senderID)) {
                const expiration = userCooldowns.get(event.senderID) + cdTime;
                if (now < expiration) {
                  const remaining = ((expiration - now) / 1000).toFixed(1);
                  return api.sendMessage(`⏳ Please wait ${remaining}s before using '${command.name}' again.`, event.threadID);
                }
              }

              userCooldowns.set(event.senderID, now);
              cooldowns.set(command.name, userCooldowns);

              try {
                await command.execute({ api, event, args, message: api.sendMessage });
              } catch (err) {
                console.error(`❌ Command '${command.name}' failed:`, err);
                api.sendMessage(`❌ CMD '${command.name}' failed`, config.ownerID);
              }
            }
          }
        } catch (err) {
          console.error("❌ Critical event error:", err);
        }
      });

    } catch (err) {
      console.error("❌ Critical bot error:", err);
    }
  });
};

// 🧼 Error Handling
process.on("unhandledRejection", err => console.error(err));
process.on("uncaughtException", err => console.error(err));

// 🚀 Launch
loadEvents();
loadCommands();
startBot();