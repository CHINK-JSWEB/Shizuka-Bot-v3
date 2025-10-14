const axios = require("axios");

module.exports = {
  name: "quiz",
  description: "Hybrid AI quiz game (5 questions) — Kaiz API with fallback",
  credits: "Jonnel Soriano",
  hasPrefix: false,
  cooldown: 3,

  async execute({ api, event }) {
    const { threadID, messageID, senderID } = event;

    api.sendMessage("🟢⚪🔴 𝗔𝗜 𝗤𝗨𝗜𝗭 𝗚𝗔𝗠𝗘 𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚...\n📘 Getting questions...", threadID, messageID);

    // Try Kaiz API first
    let questions = null;
    try {
      const resKaiz = await axios.get(`https://kaiz-apis.gleeze.com/api/quiz?limit=5&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`, { timeout: 10000 });
      if (resKaiz.data && Array.isArray(resKaiz.data.questions) && resKaiz.data.questions.length > 0) {
        // Map Kaiz format to our internal format
        questions = resKaiz.data.questions.map(q => ({
          question: q.question,
          correct_answer: q.correct_answer,
          incorrect_answers: Object.entries(q.choices)
            .filter(([key, val]) => key !== q.correct_answer)
            .map(([_, val]) => val)
        }));
      }
    } catch (err) {
      console.warn("⚠️ Kaiz quiz API failed or returned no data:", err.message);
      questions = null;
    }

    // Fallback to OpenTDB if Kaiz didn't give questions
    if (!questions) {
      try {
        const res = await axios.get("https://opentdb.com/api.php?amount=5&type=multiple", { timeout: 10000 });
        if (res.data && Array.isArray(res.data.results)) {
          questions = res.data.results.map(q => ({
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers
          }));
        }
      } catch (err) {
        console.error("❌ OpenTDB quiz fetch error:", err.message);
      }
    }

    if (!questions || questions.length === 0) {
      return api.sendMessage("❌ Walang tanong na makuha mula sa AI sources. Subukan ulit mamaya.", threadID, messageID);
    }

    // Prepare first question
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    const first = questions[0];
    const opts = [ ...first.incorrect_answers, first.correct_answer ].sort(() => Math.random() - 0.5);

    const header = `🟢⚪🔴 𝗔𝗜 𝗤𝗨𝗜𝗭 𝗚𝗔𝗠𝗘 🟢⚪🔴`;
    const msg = `${header}

📘 *Question by AI*
👨‍💻 *Creator:* Jonnel Soriano
🕒 *Time:* ${time}
📅 *Date:* ${date}
━━━━━━━━━━━━━━
❓ *Question 1:*
${first.question}

${opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}

💬 Sagot mo? (Type mo lang ang letter)
━━━━━━━━━━━━━━`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (err) {
        console.error("❌ Send question error:", err);
        return;
      }
      if (!global.client.handleReply) global.client.handleReply = [];
      global.client.handleReply.push({
        name: "quiz",
        messageID: info.messageID,
        author: senderID,
        threadID,
        questions,
        current: 0,
        score: 0,
        opts,
        correct: first.correct_answer
      });
    });
  },

  async handleReply({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;

    const userAnswer = event.body.trim().toUpperCase();
    const { questions, current, score, opts, correct } = handleReply;

    // Letters allowed
    const letters = opts.map((_, i) => String.fromCharCode(65 + i));
    if (!letters.includes(userAnswer)) {
      return api.sendMessage(`⚠️ Sagot dapat ay ${letters.join(", ")}`, event.threadID, event.messageID);
    }

    const correctIndex = opts.indexOf(correct);
    const correctLetter = String.fromCharCode(65 + correctIndex);

    // If correct
    if (userAnswer === correctLetter) {
      const newScore = score + 1;
      const next = current + 1;

      if (next >= questions.length) {
        // finished all 5
        const finalMsg = `🟢 Tama ka! 🎉\n\n🎯 *Final Score:* ${newScore}/${questions.length}\n🔚 Game Over!\n\n📘 *Game by AI*\n👨‍💻 *Creator:* Jonnel Soriano\n🤖 *Source:* ${questions[0].hasOwnProperty("incorrect_answers") ? "Kaiz API / OpenTDB" : "OpenTDB"}\n📅 ${new Date().toLocaleDateString()}\n🕒 ${new Date().toLocaleTimeString()}`;
        api.sendMessage(finalMsg, event.threadID);
        // Clear the handleReply entry
        // (Remove this entry)
        // We can filter out from global.client.handleReply
        global.client.handleReply = global.client.handleReply.filter(h => h !== handleReply);
      } else {
        // send next question
        const nextQ = questions[next];
        const nextOpts = [ ...nextQ.incorrect_answers, nextQ.correct_answer ].sort(() => Math.random() - 0.5);

        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString();
        const header = `🟢⚪🔴 𝗔𝗜 𝗤𝗨𝗜𝗭 𝗚𝗔𝗠𝗘 🟢⚪🔴`;
        const msg = `${header}

✅ Tama ka! 🎉\n\n❓ *Question ${next + 1}:*
${nextQ.question}

${nextOpts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}

💬 Sagot mo? (Type mo lang ang letter)
━━━━━━━━━━━━━━`;

        api.sendMessage(msg, event.threadID, (err, info) => {
          if (err) {
            console.error("❌ Send next question error:", err);
            return;
          }
          // update handleReply
          handleReply.current = next;
          handleReply.score = newScore;
          handleReply.opts = nextOpts;
          handleReply.correct = nextQ.correct_answer;
          handleReply.messageID = info.messageID;

          global.client.handleReply.push(handleReply);
        });
      }
    } else {
      // Wrong answer → end quiz
      const msg = `🔴 Mali! 😢\nTamang sagot: ${correctLetter}. ${correct}\n\n🎯 Final Score: ${score}/${questions.length}\n\n📘 Game by AI\n👨‍💻 Creator: Jonnel Soriano\n🤖 Source: ${questions[0].hasOwnProperty("incorrect_answers") ? "Kaiz API / OpenTDB" : "OpenTDB"}\n📅 ${new Date().toLocaleDateString()}\n🕒 ${new Date().toLocaleTimeString()}`;
      api.sendMessage(msg, event.threadID);
      // Remove from handleReply
      global.client.handleReply = global.client.handleReply.filter(h => h !== handleReply);
    }
  }
};