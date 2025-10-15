const fs = require("fs");
const path = require("path");

// Random decorative emojis for commands
const bullets = ["✨", "🎯", "💡", "🛠️", "🎉", "🔥", "🌟", "💎", "⚡", "🌀"];

module.exports = {
  name: "help",
  version: "6.8",
  author: "Jonnel",
  countDown: 5,
  role: 0,
  shortDescription: "Show all commands by category",
  longDescription: "Displays all commands grouped by category with pagination",
  category: "info",
  guide: "{pn} or {pn} [page] or {pn} [command name]",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;
    const allCommands = Array.from(global.commands.values());

    // Show specific command details
    if (args.length === 1 && isNaN(args[0])) {
      const cmdName = args[0].toLowerCase();
      const cmd = global.commands.get(cmdName);
      if (!cmd) return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID, messageID);

      const details = `
🟢⚪🔴 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 🔴⚪🟢
╭─〔 📄 ${cmd.name.toUpperCase()} 〕─╮
📚 Description : ${cmd.longDescription || cmd.shortDescription || "No description"}
📝 Usage       : ${cmd.guide || "No usage info"}
🕓 Cooldown    : ${cmd.countDown || 0}s
🛠 Version     : ${cmd.version || "1.0"}
🔑 Role        : ${cmd.role === 1 ? "ADMIN ONLY 🔐" : "EVERYONE ✅"}
╰─────────────────────────────╯
      `;
      return api.sendMessage(details, threadID, messageID);
    }

    // Pagination
    const perPage = 10;
    const totalPages = Math.ceil(allCommands.length / perPage);
    const page = args.length === 1 && !isNaN(args[0]) ? parseInt(args[0]) : 1;

    if (page < 1 || page > totalPages) {
      return api.sendMessage(`❌ Invalid page number. (1 - ${totalPages})`, threadID, messageID);
    }

    const pageItems = allCommands.slice((page - 1) * perPage, page * perPage);

    // Emoji per category
    const categoryEmoji = {
      "info": "📁",
      "edu": "📚",
      "learn": "📚",
      "image": "🖼️",
      "music": "🎧",
      "other": "👥"
    };

    // Build help message
    let msg = `🟢⚪🔴 𝗛𝗘𝗟𝗣 𝗖𝗠𝗗 🔴⚪🟢\n`;
    msg += `📜 COMMAND LIST : ${page}/${totalPages}\n`;
    msg += `─────────────────────────────\n`;

    pageItems.forEach((cmd, i) => {
      const emoji = bullets[Math.floor(Math.random() * bullets.length)]; // random bullet
      const catEmoji = categoryEmoji[cmd.category?.toLowerCase()] || "📁";
      msg += `${i + 1 + (page-1)*perPage}. ${emoji} ${catEmoji} [${cmd.category || "Others"}] ${cmd.name}\n`;
    });

    msg += `─────────────────────────────\n`;

    // Footer / Branding
    const now = new Date();
    const timeDate = now.toLocaleString("en-PH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    msg += `👑 Bot Owner  : Jonnel Soriano\n`;
    msg += `🕵‍♀️ Bot Name  : Shizuka\n`;
    msg += `🕒 Time & Date: ${timeDate}\n`;
    msg += `─────────────────────────────\n`;
    msg += `📌 Use help [command] → view command details\n`;
    msg += `📌 Use help [page] → view next page\n`;
    msg += `╰───────────────────────────╯`;

    return api.sendMessage(msg, threadID, messageID);
  }
};