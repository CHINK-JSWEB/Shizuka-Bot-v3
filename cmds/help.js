module.exports = {
  config: {
    name: "help",
    version: "6.1",
    author: "Nikox",
    countDown: 5,
    role: 0,
    shortDescription: "Show all commands (paginated)",
    longDescription: "Displays all commands in vertical list, 25 per page",
    category: "info",
    guide: "{pn} or {pn} [page] or {pn} [command name]"
  },

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    const allCommands = Array.from(global.commands.values());
    const commandNames = allCommands.map(cmd => cmd.name).sort();
    const totalCommands = commandNames.length;

    // Show command detail if name provided
    if (args.length === 1 && isNaN(args[0])) {
      const cmdName = args[0].toLowerCase();
      const cmd = global.commands.get(cmdName);
      if (!cmd) {
        return api.sendMessage(`COMMAND "${cmdName}" NOT FOUND.`, threadID, messageID);
      }

      const details =
        `📄 COMMAND: ${cmd.name.toUpperCase()}\n` +
        `📚 DESCRIPTION: ${cmd.usage || "NO USAGE INFO"}\n` +
        `🕓 COOLDOWN: ${cmd.cooldown || 0}S\n` +
        `🛠 VERSION: ${cmd.version || "1.0"}\n` +
        `🔑 ROLE: ${cmd.admin ? "ADMIN ONLY 🔐" : "EVERYONE ✅"}`;

      return api.sendMessage(details, threadID, messageID);
    }

    // Pagination setup
    const pageSize = 25;
    const totalPages = Math.ceil(totalCommands / pageSize);
    const page = args.length > 0 && !isNaN(args[0]) ? Math.max(1, Math.min(totalPages, parseInt(args[0]))) : 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = commandNames.slice(start, end);

    // Format vertical list
    const commandList = paginated.map(name => `📁 ${name}`).join("\n");

    const commandMsg =
      `✨ TOTAL COMMANDS: ${totalCommands}\n` +
      `📂 PAGE: ${page}/${totalPages}\n\n` +
      `${commandList}\n\n` +
      `📌 USE: HELP [PAGE] OR HELP [COMMAND]\n\n` +
      `BOT BY: ANGEL NICO P IGDALINO`;

    return api.sendMessage(commandMsg, threadID, messageID);
  }
};
