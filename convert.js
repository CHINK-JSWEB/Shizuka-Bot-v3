const fs = require("fs");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m"
};

// Check if cookies.txt exists
if (!fs.existsSync("cookies.txt")) {
  console.error(`${colors.red}❌ Error:${colors.reset} cookies.txt not found!`);
  process.exit(1);
}

try {
  const cookiesText = fs.readFileSync("cookies.txt", "utf-8");

  // Remove empty or comment lines
  const lines = cookiesText.split("\n").filter(line => line && !line.startsWith("#"));

  const appState = lines.map(line => {
    const parts = line.split("\t");
    if (parts.length < 7) return null;

    return {
      key: parts[5],
      value: parts[6],
      domain: parts[0],
      path: parts[2],
      hostOnly: parts[1] === "FALSE",
      creation: Date.now(),
      lastAccessed: Date.now()
    };
  }).filter(Boolean);

  fs.writeFileSync("appState.json", JSON.stringify(appState, null, 2));

  console.log(`${colors.green}✅ Success:${colors.reset} Converted cookies.txt → appState.json`);
  console.log(`${colors.yellow}📁 Output:${colors.reset} appState.json`);
} catch (err) {
  console.error(`${colors.red}⚠️ Conversion failed:${colors.reset} ${err.message}`);
}
