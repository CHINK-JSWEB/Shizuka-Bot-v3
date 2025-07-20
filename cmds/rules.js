module.exports = {
  name: "rule",
  description: "Shows the white hat hacker organization rules",
  usage: "rule",
  cooldown: 10,
  hasPermission: 0,
  usePrefix: true,
  credits: "Nikox",

  async execute({ api, event }) {
    const rules = 
`📜 WHITE HAT HACKER ORGANIZATION RULES

1. ✅ Always follow the law – Sumunod sa mga batas at regulasyon sa lahat ng hacking activities.

2. 🕵️ Respect privacy – Igalang ang privacy ng mga indibidwal at organisasyon.

3. 📝 Get permission – Kumuha ng permiso bago magsagawa ng penetration testing o vulnerability assessment.

4. 🔍 Be transparent – Maging bukas at tapat sa mga kliyente tungkol sa mga findings at recommendations.

5. 🔒 Keep it confidential – Panatilihin ang confidentiality ng mga sensitive information.

6. 🤝 Use skills for good – Gamitin ang mga hacking skills para sa mga legitimate at ethical purposes lamang.

7. 🧠 Stay updated – Panatilihin ang kaalaman sa mga pinakabagong hacking techniques at security measures.

8. 👥 Collaborate responsibly – Magtulungan sa ibang mga security professionals at stakeholders para sa ikabubuti ng cybersecurity.

9. 📂 Document everything – Dokumentuhin ang lahat ng mga findings, methods, at recommendations.

10. 📚 Continuously learn – Patuloy na pagbutihin ang mga skills at kaalaman sa cybersecurity.`;

    return api.sendMessage(rules, event.threadID, event.messageID);
  }
};
