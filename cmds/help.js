module.exports = {
  name: "help",
  version: "6.3",
  author: "Jonnel",
  countDown: 5,
  role: 0,
  shortDescription: "Show all commands by category",
  longDescription: "Displays all commands grouped by category with pagination",
  category: "info",
  guide: "{pn} or {pn} [page] or {pn} [command name]",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    // All commands from your global registry
    const allCommands = Array.from(global.commands.values());

    // If a command name is passed, show its details
    if (args.length === 1 && isNaN(args[0])) {
      const cmdName = args[0].toLowerCase();
      const cmd = global.commands.get(cmdName);
      if (!cmd) {
        return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID, messageID);
      }

      const details =
`📄 COMMAND: ${cmd.name.toUpperCase()}
📚 DESCRIPTION: ${cmd.longDescription || cmd.shortDescription || "No description"}
📝 USAGE: ${cmd.guide || "No usage info"}
🕓 COOLDOWN: ${cmd.countDown || 0}s
🛠 VERSION: ${cmd.version || "1.0"}
🔑 ROLE: ${cmd.role === 1 ? "ADMIN ONLY 🔐" : "EVERYONE ✅"}`;

      return api.sendMessage(details, threadID, messageID);
    }

    // Group commands by category
    const grouped = {};
    for (const cmd of allCommands) {
      const cat = cmd.category || "Others";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd.name);
    }

    // flatten commands (for pagination)
    const flatList = [];
    for (const [cat, names] of Object.entries(grouped)) {
      flatList.push({ cat, names });
    }

    // pagination
    const perPage = 25;
    const page = args.length === 1 && !isNaN(args[0]) ? parseInt(args[0]) : 1;
    const totalPages = Math.ceil(flatList.length / perPage);
    const pageIndex = page - 1;

    if (page < 1 || page > totalPages) {
      return api.sendMessage(`❌ Invalid page number. (1 - ${totalPages})`, threadID, messageID);
    }

    const pageItems = flatList.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

    // Format like the picture
    let msg = `╭───〔 📜 Available Commands 〕───╮\n`;
    msg += `📊 Total Commands: ${allCommands.length}\n`;
    msg += `📑 Page: ${page}/${totalPages}\n\n`;

    for (const section of pageItems) {
      const { cat, names } = section;
      // choose emoji based on category
      let emoji = "📁";
      if (/edu|learn/i.test(cat)) emoji = "📚";
      if (/image/i.test(cat)) emoji = "🖼️";
      if (/music/i.test(cat)) emoji = "🎧";
      if (/other/i.test(cat)) emoji = "👥";

      msg += `${emoji} | ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
      msg += names.map(n => `- ${n}`).join("\n") + "\n\n";
    }
    msg += "╰───────────────────────────╯\n";
    msg += `📌 Use: help [command] to see details\n`;
    msg += `📌 Use: help [page] to see more pages\n`;
    msg += "🤖 Bot by: JONNEL SORIANO";

    return api.sendMessage(msg, threadID, messageID);
  }
};
