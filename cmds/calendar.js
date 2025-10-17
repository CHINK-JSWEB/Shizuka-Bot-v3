// cmds/calendar.js
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const eventsFile = path.join(__dirname, "calendarEvents.json");

// Ensure file exists
if (!fs.existsSync(eventsFile)) fs.writeFileSync(eventsFile, "{}");

module.exports = {
  config: {
    name: "calendar",
    aliases: ["cal", "date"],
    version: "2.0",
    author: "Jonnel Soriano",
    role: 0,
    guide: {
      en: "calendar [month] [year]\ncalendar add <day> <event>\ncalendar list"
    }
  },

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const tz = "Asia/Manila";
    const now = moment().tz(tz);
    let events = JSON.parse(fs.readFileSync(eventsFile, "utf8"));

    // Auto-create thread entry
    if (!events[threadID]) events[threadID] = {};

    // Subcommands
    const sub = args[0]?.toLowerCase();

    // ─────────────── ADD EVENT ───────────────
    if (sub === "add") {
      if (args.length < 3)
        return api.sendMessage("📝 | Usage: calendar add <day> <event>", threadID, messageID);

      const day = parseInt(args[1]);
      if (isNaN(day) || day < 1 || day > 31)
        return api.sendMessage("❌ | Invalid day. (1–31 only)", threadID, messageID);

      const text = args.slice(2).join(" ");
      const month = now.month() + 1;
      const year = now.year();
      const key = `${year}-${month}`;

      if (!events[threadID][key]) events[threadID][key] = {};
      if (!events[threadID][key][day]) events[threadID][key][day] = [];

      events[threadID][key][day].push(text);
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));

      return api.sendMessage(
        `✅ Event added on ${day}/${month}/${year}!\n🗓 ${text}`,
        threadID,
        messageID
      );
    }

    // ─────────────── LIST EVENTS ───────────────
    if (sub === "list") {
      const month = now.month() + 1;
      const year = now.year();
      const key = `${year}-${month}`;
      const monthEvents = events[threadID][key];

      if (!monthEvents || Object.keys(monthEvents).length === 0)
        return api.sendMessage("📭 | No events for this month.", threadID, messageID);

      let list = `🗓 EVENTS FOR ${now.format("MMMM YYYY")}\n───────────────────────────────\n`;
      for (const [day, evts] of Object.entries(monthEvents)) {
        list += `📅 ${day}:\n  • ${evts.join("\n  • ")}\n`;
      }
      list += "───────────────────────────────\n⚡ POWERED BY : Jonnel Soriano 💻";

      return api.sendMessage(list, threadID, messageID);
    }

    // ─────────────── SHOW CALENDAR ───────────────
    let month, year;
    if (args.length === 0) {
      month = now.month() + 1;
      year = now.year();
    } else if (args.length === 1) {
      month = parseInt(args[0]);
      year = now.year();
    } else {
      month = parseInt(args[0]);
      year = parseInt(args[1]);
    }

    if (isNaN(month) || month < 1 || month > 12)
      return api.sendMessage("❌ | Invalid month (1–12).", threadID, messageID);

    const firstDay = moment.tz(`${year}-${month}-01`, tz);
    const daysInMonth = firstDay.daysInMonth();
    const startDay = firstDay.day();
    const monthName = firstDay.format("MMMM");

    let calText = `📅 SHIZUKA SMART CALENDAR\n\n📆 ${monthName.toUpperCase()} ${year}\n`;
    calText += "───────────────────────────────\nSu Mo Tu We Th Fr Sa\n";

    let week = "";
    for (let i = 0; i < startDay; i++) week += "   ";
    for (let day = 1; day <= daysInMonth; day++) {
      week += day.toString().padStart(2, " ") + " ";
      if ((startDay + day) % 7 === 0 || day === daysInMonth) {
        calText += week.trimEnd() + "\n";
        week = "";
      }
    }

    if (month === now.month() + 1 && year === now.year()) {
      calText += `\n📍 Today: ${now.date()} ${monthName} ${year}`;
    }

    // Check events in that month
    const key = `${year}-${month}`;
    if (events[threadID][key] && Object.keys(events[threadID][key]).length > 0) {
      calText += `\n\n📋 EVENTS:\n`;
      for (const [day, evts] of Object.entries(events[threadID][key])) {
        calText += `📅 ${day}: ${evts.join(", ")}\n`;
      }
    }

    calText += "───────────────────────────────\n⚡ POWERED BY : Jonnel Soriano 💻";

    const sent = await api.sendMessage(calText, threadID, messageID);
    api.setMessageReaction("📅", sent.messageID, () => {}, true);
  }
};