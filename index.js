// index.js — Jonnelbot V2 by Jonnel Soriano

const fs = require("fs");
const path = require("path");
const express = require("express");
const login = require("ws3-fca");
const os = require("os");
const { execSync } = require("child_process");

const app = express();
const PORT = 3000;

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

// 🧾 Load Config
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

// 📂 Load Events
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

// 📂 Load Commands
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

// 🔐 Reset admin-only on startup
const adminFile = path.join(__dirname, "adminMode.json");
try {
  fs.writeFileSync(adminFile, JSON.stringify({ enabled: false }, null, 2));
  console.log("🔓 Admin-only mode reset to OFF on startup.");
} catch (err) {
  console.error("❌ Failed to write adminMode.json:", err);
}

// 🤖 Start Bot
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

      const gifPath = path.join(__dirname, "assets", "nikoxcat.gif");
      const botInfo = {
        body: `🟢⚪🔴 *JONNELBOT V2 ONLINE*\n🤖 AI SYSTEM ACTIVATED\n👨‍💻 Creator: Jonnel Soriano\n━━━━━━━━━━━━━━━\n📌 Prefix: ${botPrefix}`,
        attachment: fs.existsSync(gifPath) ? fs.createReadStream(gifPath) : undefined
      };
      api.sendMessage(botInfo, config.ownerID);

      const botUID = api.getCurrentUserID();

      api.listenMqtt(async (err, event) => {
        if (err) return console.error("❌ Listener error:", err);
        if (!event || event.senderID === botUID) return;

        let echoConfig = {};
        if (fs.existsSync(echoPath)) {
          try {
            echoConfig = JSON.parse(fs.readFileSync(echoPath, "utf8"));
          } catch (e) {
            console.error("❌ Failed to read echo-config.json:", e);
          }
        }

        // 🔁 Event Handlers
        const handlers = global.events.get(event.type);
        if (Array.isArray(handlers)) {
          for (const handler of handlers) {
            try {
              await handler({ api, event });
            } catch (err) {
              console.error("❌ Error in event handler:", err);
            }
          }
        }

        // 🌐 URL Detection
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        if (event.body && urlRegex.test(event.body)) {
          const urlCmd = global.commands.get("url");
          if (urlCmd) {
            const detectedURL = event.body.match(urlRegex)[0];
            const key = `${event.threadID}-${detectedURL}`;
            if (!detectedURLs.has(key)) {
              detectedURLs.add(key);
              try {
                await urlCmd.execute({ api, event });
              } catch (err) {
                console.error("❌ URL Command Failed:", err);
              }
              setTimeout(() => detectedURLs.delete(key), 3600000);
            }
          }
        }

        // 💬 Command Handler
        if (event.body) {
          let args = event.body.trim().split(/ +/);
          let commandName = args.shift().toLowerCase();
          let command = global.commands.get(commandName);

          if (!command && event.body.startsWith(botPrefix)) {
            commandName = event.body.slice(botPrefix.length).split(/ +/).shift().toLowerCase();
            command = global.commands.get(commandName);
          }

          if (command) {
            if (command.usePrefix && !event.body.startsWith(botPrefix)) return;

            let isAdminOnly = false;
            if (fs.existsSync(adminFile)) {
              try {
                const data = JSON.parse(fs.readFileSync(adminFile));
                isAdminOnly = data.enabled;
              } catch (e) {
                console.error("❌ Error reading adminMode.json:", e);
              }
            }

            const ADMIN_UID = "100082770721408";
            if (isAdminOnly && event.senderID !== ADMIN_UID) {
              return api.sendMessage("🔐 Admin-only mode is ON.\nYou can't use commands.", event.threadID);
            }

            const now = Date.now();
            const key = `${event.senderID}-${command.name}`;
            const lastUsed = cooldowns.get(key) || 0;
            const delay = (command.cooldown || 0) * 1000;

            if (now - lastUsed < delay) {
              const wait = ((delay - (now - lastUsed)) / 1000).toFixed(1);
              return api.sendMessage(`⏳ Wait ${wait}s before using '${command.name}' again.`, event.threadID);
            }

            try {
              await command.execute({ api, event, args, message: api.sendMessage });
              cooldowns.set(key, now);
            } catch (err) {
              console.error(`❌ Command '${command.name}' failed:`, err);
              api.sendMessage(`❌ CMD '${command.name}' failed:\n${err.stack}`, config.ownerID);
            }
          }
        }

        // 🗣️ Echo Feature
        if (
          event.body &&
          echoConfig[event.threadID] &&
          echoConfig[event.threadID].enabled === true
        ) {
          api.sendMessage(`🗣️ ${event.body}`, event.threadID);
        }
      });
    } catch (err) {
      console.error("❌ Critical bot error:", err);
    }
  });
};

// 🧼 Error Handling
process.on("unhandledRejection", err => console.error("⚠️ Unhandled Rejection:", err));
process.on("uncaughtException", err => console.error("❌ Uncaught Exception:", err));

// 🌐 Web Panel
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

// 🚀 Launch Bot
loadEvents();
loadCommands();
startBot();