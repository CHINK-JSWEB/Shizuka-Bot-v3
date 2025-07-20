// cmds/bible.js
module.exports = {
  name: "bible",
  version: "1.0.0",
  description: "Magbigay ng random na Tagalog Bible verse.",
  usage: "bible",
  cooldown: 3,
  hasPermission: 0,
  usePrefix: false,
  credits: "Nikox",

  async execute({ api, event }) {
    const verses = [
      "🕊️ Juan 3:16\n“Sapagkat gayon na lamang ang pag-ibig ng Diyos sa sanlibutan kaya’t ibinigay niya ang kanyang kaisa-isang Anak, upang ang sinumang sumampalataya sa kanya ay hindi mapahamak, kundi magkaroon ng buhay na walang hanggan.”",
      "🕊️ Filipos 4:13\n“Ang lahat ng bagay ay aking magagawa sa pamamagitan ni Cristo na nagpapalakas sa akin.”",
      "🕊️ Jeremias 29:11\n“Sapagkat nalalaman ko ang mga plano ko para sa inyo,’ sabi ng Panginoon. ‘Mga planong hindi upang saktan kayo kundi bigyan kayo ng pag-asa at magandang kinabukasan.”",
      "🕊️ Awit 23:1\n“Ang Panginoon ang aking pastol, hindi ako magkukulang.”",
      "🕊️ Kawikaan 3:5\n“Magtiwala ka sa Panginoon ng buong puso mo at huwag kang manalig sa iyong sariling kaalaman.”",
      "🕊️ Roma 8:28\n“Alam natin na sa lahat ng bagay, ang Diyos ay gumagawa para sa ikabubuti ng mga umiibig sa kanya.”",
      "🕊️ Isaias 41:10\n“Huwag kang matakot sapagkat ako'y kasama mo; huwag kang manglupaypay sapagkat ako ang iyong Diyos.”",
      "🕊️ Mateo 11:28\n“Lumapit kayo sa akin, kayong lahat na nahihirapan at nabibigatan sa pasanin, at kayo'y bibigyan ko ng kapahingahan.”",
      "🕊️ 1 Pedro 5:7\n“Ipagkatiwala ninyo sa kanya ang lahat ng inyong alalahanin, sapagkat siya ay nagmamalasakit sa inyo.”",
      "🕊️ Roma 10:9\n“Kung ipahahayag mo sa iyong bibig na si Hesus ay Panginoon at mananampalataya ka sa iyong puso na siya'y muling binuhay ng Diyos, ikaw ay maliligtas.”"
    ];

    const verse = verses[Math.floor(Math.random() * verses.length)];
    api.sendMessage(verse, event.threadID, event.messageID);
  }
};
