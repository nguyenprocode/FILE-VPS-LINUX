const fs = require("fs");
const axios = require("axios");
const request = require("request");
const path = require("path");

module.exports.config = {
  name: "ghepdoi",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "Satoru",
  description: "Ghép đôi, cầu hôn và quản lý thông tin cặp đôi",
  commandCategory: "Tình yêu",
  usages: "[info/lyhon]",
  cooldowns: 5,
};

let userMarriages = {};
let happinessScores = {};
let dailyInteractions = {};
let userRings = {};const rings = [
  { name: "Nhẫn bạc đơn giản", price: 1000000, emoji: "💍" },
  { name: "Nhẫn vàng cổ điển", price: 5000000, emoji: "💍" },
  { name: "Nhẫn kim cương nhỏ", price: 10000000, emoji: "💎" },
  { name: "Nhẫn bạch kim tinh tế", price: 15000000, emoji: "💍" },
  { name: "Nhẫn hồng ngọc rực rỡ", price: 20000000, emoji: "💍" },
  { name: "Nhẫn sapphire xanh biển", price: 25000000, emoji: "💍" },
  { name: "Nhẫn ngọc lục bảo quý phái", price: 30000000, emoji: "💍" },
  { name: "Nhẫn kim cương lớn", price: 50000000, emoji: "💎" },
  { name: "Nhẫn đính hồng ngọc và kim cương", price: 60000000, emoji: "💎" },
  { name: "Nhẫn vàng 24K khắc tên", price: 40000000, emoji: "💍" },
  { name: "Nhẫn bạch kim đính ngọc trai", price: 35000000, emoji: "💍" },
  { name: "Nhẫn titan cá tính", price: 3000000, emoji: "💍" },
  { name: "Nhẫn gỗ và bạc handmade", price: 2000000, emoji: "💍" },
  { name: "Nhẫn vàng hồng romantique", price: 8000000, emoji: "💍" },
  { name: "Nhẫn đá mặt trăng huyền bí", price: 12000000, emoji: "🌙" },
  { name: "Nhẫn đính đá topaz xanh", price: 18000000, emoji: "💍" },
  { name: "Nhẫn vàng trắng phối kim cương", price: 45000000, emoji: "💎" },
  { name: "Nhẫn đá opal cầu vồng", price: 22000000, emoji: "🌈" },
  { name: "Nhẫn bạc đính đá peridot", price: 7000000, emoji: "💍" },
  { name: "Nhẫn vàng 18K phong cách minimalist", price: 9000000, emoji: "💍" },
  { name: "Nhẫn đính đá garnet đỏ rượu", price: 16000000, emoji: "💍" },
  { name: "Nhẫn bạch kim đính kim cương đen", price: 55000000, emoji: "💎" },
  { name: "Nhẫn vàng điêu khắc hoa văn cổ", price: 28000000, emoji: "💍" },
  { name: "Nhẫn đá citrine vàng óng", price: 14000000, emoji: "💍" },
  { name: "Nhẫn bạc 925 đính đá cubic zirconia", price: 1500000, emoji: "💍" }
];

const malePickupLines = [
  (nam, nu) => `${nam} có thể đưa ${nu} đi xem phim không? Bởi vì ${nu} chính là bộ phim yêu thích của ${nam}.`,
  (nam, nu) => `${nu} có phải là WiFi không? Vì ${nam} cảm thấy một sự kết nối.`,
  (nam, nu) => `Nếu được phép, ${nam} muốn trở thành người hùng trong câu chuyện đời ${nu}.`,
  (nam, nu) => `${nu} có tin vào tình yêu từ cái nhìn đầu tiên không? Hay ${nam} cần phải đi qua lần nữa?`,
  (nam, nu) => `${nam} không phải là nhiếp ảnh gia, nhưng ${nam} có thể thấy ${nam} và ${nu} cùng nhau trong tương lai.`,
  (nam, nu) => `${nu} có biết ${nu} nặng bao nhiêu không? Đủ để đè nặng trái tim ${nam} rồi đấy.`,
  (nam, nu) => `${nam} đang tìm kiếm kho báu, và ${nam} vừa tìm thấy ${nu}.`,
  (nam, nu) => `${nu} có phải là phù thủy không? Vì ${nu} đã phù phép trái tim ${nam} rồi.`,
  (nam, nu) => `${nam} không cần Google, vì ${nu} là tất cả những gì ${nam} đang tìm kiếm.`,
  (nam, nu) => `Nếu ${nu} là một bài hát, ${nam} sẽ để ${nu} trong playlist yêu thích của mình.`,
  (nam, nu) => `${nam} không biết đường về nhà. ${nu} có thể chỉ đường đến trái tim ${nu} được không?`,
  (nam, nu) => `${nu} có phải là nghệ sĩ không? Vì ${nu} đã vẽ nên một bức tranh hoàn hảo trong tim ${nam}.`,
  (nam, nu) => `${nam} đang nghĩ ${nu} nợ ${nam} một ly cà phê. Bởi vì khi nhìn thấy ${nu}, ${nam} đã đánh rơi ly của mình.`,
  (nam, nu) => `${nu} có biết ${nu} giống cái gì không? Giống như ly cà phê buổi sáng của ${nam} vậy - nóng bỏng và làm cho ${nam} tỉnh táo cả ngày.`,
  (nam, nu) => `Nếu ${nu} là một loại trái cây, chắc hẳn ${nu} sẽ là quả cherry trên top của cuộc đời ${nam}.`,
  (nam, nu) => `${nam} vừa nhìn vào mắt ${nu} và ${nam} đã thấy được tương lai của mình.`,
  (nam, nu) => `${nu} có biết ${nu} đã vi phạm luật không? Vì việc xinh đẹp đến mức này là bất hợp pháp đấy.`,
  (nam, nu) => `${nam} không phải là nhà toán học, nhưng ${nam} chắc chắn ${nam} và ${nu} là một phương trình hoàn hảo.`,
  (nam, nu) => `${nu} có tin vào tình yêu sét đánh không? Hay ${nam} cần đi qua ${nu} lần nữa?`,
  (nam, nu) => `Xin lỗi, ${nam} vừa đánh rơi một cái gì đó. Đó là quả tim của ${nam}, và nó đang hướng về phía ${nu}.`,
  (nam, nu) => `${nu} có phải là một ngôi sao không? Vì mỗi khi ${nam} nhìn ${nu}, cả thế giới như biến mất.`,
  (nam, nu) => `${nam} đang tự hỏi nếu ${nu} có bảo hiểm không? Vì ${nu} trông thật là nguy hiểm... nguy hiểm đến mức khiến tim ${nam} đập nhanh.`,
  (nam, nu) => `${nu} có tin vào tình yêu online không? Hay ${nam} cần phải tắt đi bật lại một lần nữa?`,
  (nam, nu) => `${nam} không phải là nhà văn, nhưng ${nam} có thể viết nên một câu chuyện tình yêu đẹp với ${nu}.`,
  (nam, nu) => `${nu} có phải là một cuốn từ điển không? Vì ${nu} đã thêm ý nghĩa vào cuộc đời ${nam}.`,
  (nam, nu) => `${nam} đang tìm kiếm một địa chỉ. ${nu} có thể chỉ đường đến trái tim ${nu} được không?`,
  (nam, nu) => `${nu} có phải là một phép thuật không? Vì mỗi khi ${nam} nhìn ${nu}, cả thế giới xung quanh đều biến mất.`,
  (nam, nu) => `${nam} không phải là người mê tín, nhưng ${nam} nghĩ ${nam} và ${nu} là định mệnh của nhau.`,
  (nam, nu) => `${nu} có biết ${nu} giống cái gì không? Giống như một tác phẩm nghệ thuật vậy - ${nam} có thể ngắm ${nu} cả ngày.`,
  (nam, nu) => `Xin lỗi, ${nam} phải báo cảnh sát rồi. Vì ${nu} đã ăn trộm trái tim của ${nam}.`
];

const femalePickupLines = [
  (nam, nu) => `${nam} có tin vào tình yêu từ cái nhìn đầu tiên không? Hay ${nu} cần đi qua lần nữa?`,
  (nam, nu) => `Nếu ${nam} là một cuốn sách, ${nu} sẽ đọc ${nam} cả ngày.`,
  (nam, nu) => `${nu} không phải là Cinderella, nhưng ${nu} có thể thấy ${nam} là hoàng tử của ${nu}.`,
  (nam, nu) => `${nam} có phải là ánh nắng không? Vì ${nam} làm sáng cả ngày của ${nu}.`,
  (nam, nu) => `${nu} không cần đường, vì ${nam} đã đủ ngọt ngào rồi.`,
  (nam, nu) => `${nam} có bị đau không khi ngã từ thiên đường xuống?`,
  (nam, nu) => `${nu} đang tìm kiếm một nửa còn lại của mình, và ${nu} nghĩ ${nu} vừa tìm thấy ${nam}.`,
  (nam, nu) => `${nam} có phải là nghệ sĩ không? Vì ${nam} vẽ nên một bức tranh hoàn hảo trong tim ${nu}.`,
  (nam, nu) => `${nu} không phải là nhà toán học, nhưng ${nu} biết rằng ${nam} và ${nu} bằng một cặp hoàn hảo.`,
  (nam, nu) => `Nếu ${nam} là một ngôi sao, ${nu} sẽ ước được ở bên ${nam} mỗi đêm.`,
  (nam, nu) => `${nu} đang tự hỏi nếu ${nam} có một bản đồ? Vì ${nu} cứ lạc trong đôi mắt của ${nam} mãi.`,
  (nam, nu) => `${nam} có phải là một camera không? Mỗi khi ${nu} nhìn ${nam}, ${nu} lại không thể không mỉm cười.`,
  (nam, nu) => `${nu} nghĩ ${nam} phải là một tên trộm, vì ${nam} vừa đánh cắp trái tim của ${nu} đấy.`,
  (nam, nu) => `${nam} có tin vào định mệnh không? Vì ${nu} cảm thấy chúng ta được định sẵn để gặp nhau rồi.`,
  (nam, nu) => `Nếu ${nam} là một bản nhạc, ${nu} sẽ là người nghe trung thành nhất của ${nam} đấy.`,
  (nam, nu) => `${nam} có phải là một bài thơ không? Vì ${nam} quá đẹp để diễn tả bằng lời.`,
  (nam, nu) => `${nu} đang tìm kiếm một người bạn đồng hành trong cuộc sống, và ${nu} nghĩ ${nam} sẽ là người hoàn hảo.`,
  (nam, nu) => `${nam} có tin vào phép màu không? Vì ${nu} nghĩ việc gặp được ${nam} chính là một phép màu.`,
  (nam, nu) => `Nếu cuộc đời là một bộ phim, ${nu} muốn ${nam} là người đóng vai chính cùng ${nu}.`,
  (nam, nu) => `${nu} không phải là nhà thiên văn học, nhưng ${nu} có thể thấy các vì sao trong mắt ${nam}.`,
  (nam, nu) => `${nam} có phải là một cuốn từ điển không? Vì ${nam} đã thêm ý nghĩa vào cuộc đời ${nu}.`,
  (nam, nu) => `${nu} đang tìm kiếm một lý do để tin vào tình yêu, và ${nu} nghĩ ${nam} chính là lý do đó.`,
  (nam, nu) => `${nam} có biết ${nam} giống cái gì không? Giống như một giấc mơ đẹp mà ${nu} không muốn tỉnh dậy.`,
  (nam, nu) => `Nếu ${nam} là một món quà, ${nu} sẽ không bao giờ nghĩ đến việc đổi ${nam}.`,
  (nam, nu) => `${nu} đang tự hỏi liệu ${nam} có phải là một phép thuật không? Vì mỗi khi ${nu} ở gần ${nam}, mọi thứ đều trở nên tuyệt vời hơn.`,
  (nam, nu) => `${nam} có tin vào tình yêu online không? Vì ${nu} nghĩ ${nu} vừa nhấn like vào trái tim của ${nam}.`,
  (nam, nu) => `Nếu cuộc đời là một bữa tiệc, ${nu} muốn ${nam} là món tráng miệng ngọt ngào nhất.`,
  (nam, nu) => `${nu} không phải là nhà văn, nhưng ${nu} muốn viết nên câu chuyện tình yêu với ${nam}.`,
  (nam, nu) => `${nam} có phải là một bài hát không? Vì ${nam} đang vang lên trong trái tim ${nu}.`,
  (nam, nu) => `Nếu tình yêu là một trò chơi, ${nu} muốn ${nam} là đồng đội của ${nu}.`
];

function saveData() {
  fs.writeFileSync('./modules/commands/data/marriages.json', JSON.stringify({
    marriages: userMarriages,
    happiness: happinessScores,
    interactions: dailyInteractions,
    rings: userRings
  }));
}

function loadData() {
  if (fs.existsSync('./modules/commands/data/marriages.json')) {
    const data = JSON.parse(fs.readFileSync('./modules/commands/data/marriages.json'));
    userMarriages = data.marriages || {};
    happinessScores = data.happiness || {};
    dailyInteractions = data.interactions || {};
    userRings = data.rings || {};
  }
}

async function getAvatar(userID) {
  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  const avatarPath = path.join(cacheDir, `${userID}.png`);
  
  if (fs.existsSync(avatarPath)) {
    return avatarPath;
  }

  const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(avatarPath, Buffer.from(response.data));
    return avatarPath;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return null;
  }
}

module.exports.run = async function({ api, event, args, Users, Currencies }) {
  const { threadID, messageID, senderID } = event;

  loadData();

  if (args[0] === "info") {
    if (!userMarriages[senderID]) {
      return api.sendMessage("Bạn chưa kết hôn với ai.", threadID, messageID);
    }

    const partnerID = userMarriages[senderID];
    const userName = await Users.getNameUser(senderID);
    const partnerName = await Users.getNameUser(partnerID);
    const happiness = happinessScores[senderID] || 50;
    
    let happinessDescription = "";
    if (happiness < 20) happinessDescription = "Rạn nứt nghiêm trọng";
    else if (happiness < 40) happinessDescription = "Có chút bất hòa";
    else if (happiness < 60) happinessDescription = "Bình thường";
    else if (happiness < 80) happinessDescription = "Hạnh phúc";
    else happinessDescription = "Vô cùng hạnh phúc";

    const ring = userRings[senderID] || { name: "Chưa có nhẫn", emoji: "❓" };

    const message = `👩‍❤️‍👨 Thông tin cặp đôi:
👫 ${userName} 💕 ${partnerName}
💍 Nhẫn cưới: ${ring.emoji} ${ring.name}
💖 Độ hạnh phúc: ${happiness}%
😊 Trạng thái: ${happinessDescription}

💡 Tương tác nhiều với nhau để tăng độ hạnh phúc nhé!`;

    const avatarUser = await getAvatar(senderID);
    const avatarPartner = await getAvatar(partnerID);

    if (avatarUser && avatarPartner) {
      const imgBuffer = await api.getImageBuffer();
      const attachments = [
        {
          key: 'avatar_user',
          url: `file://${avatarUser}`,
        },
        {
          key: 'avatar_partner',
          url: `file://${avatarPartner}`,
        },
      ];

      return api.sendMessage({ body: message, attachment: attachments }, threadID, messageID);
    } else {
      return api.sendMessage(message, threadID, messageID);
    }
  }

  if (args[0] === "lyhon") {
    if (!userMarriages[senderID]) {
      return api.sendMessage("Bạn chưa kết hôn với ai.", threadID, messageID);
    }

    const partnerID = userMarriages[senderID];
    const userName = await Users.getNameUser(senderID);
    const partnerName = await Users.getNameUser(partnerID);

    delete userMarriages[senderID];
    delete userMarriages[partnerID];
    delete happinessScores[senderID];
    delete happinessScores[partnerID];
    delete userRings[senderID];
    delete userRings[partnerID];
    saveData();

    return api.sendMessage(`💔 ${userName} và ${partnerName} đã chính thức ly hôn. Chúc cả hai tìm được hạnh phúc mới!`, threadID, messageID);
  }


  if (!args[0]) {
    if (userMarriages[senderID]) {
      return api.sendMessage("Bạn đã có cặp rồi!", threadID, messageID);
    }
    
    const token = `6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const tile = Math.floor(Math.random() * 101);

    api.sendMessage(`📌 Đang tìm đối tượng hợp với bạn!...`, threadID);

    const ThreadInfo = await api.getThreadInfo(threadID);
    const all = ThreadInfo.userInfo;
    
    const currentUser = all.find(user => user.id == senderID);
    if (!currentUser) {
      return api.sendMessage("Không thể lấy thông tin của bạn.", threadID, messageID);
    }

    let matchedUsers = all.filter(user => 
      user.gender !== currentUser.gender && 
      user.id !== senderID && 
      !userMarriages[user.id]
    );

    if (matchedUsers.length === 0) {
      return api.sendMessage(`Rất tiếc, không tìm thấy đối tượng phù hợp và độc thân trong nhóm này.`, threadID, messageID);
    }

    const matchedUser = matchedUsers[Math.floor(Math.random() * matchedUsers.length)];

    const userName = await Users.getNameUser(senderID);
    const matchedUserName = await Users.getNameUser(matchedUser.id);

    let pickupLine;
    if (matchedUser.gender === 'FEMALE') {
      const randomLine = malePickupLines[Math.floor(Math.random() * malePickupLines.length)];
      pickupLine = randomLine(userName, matchedUserName);
    } else {
      const randomLine = femalePickupLines[Math.floor(Math.random() * femalePickupLines.length)];
      pickupLine = randomLine(matchedUserName, userName);
    }

    const avatarUser = await getAvatar(senderID);
    const avatarMatched = await getAvatar(matchedUser.id);

    const msg = {
      body: `[ TINDER DATING LOVE ]\n━━━━━━━━━━━━━━━━━━\n🥰 Ghép đôi thành công!\n💌 Thính: ${pickupLine}\n💞 Tỉ lệ hợp nhau: ${tile}%\n❤️ Tên người ấy: ${matchedUserName}\n🤍 Tên của bạn: ${userName}\n\nNếu cả hai đồng ý tiến tới mối quan hệ, hãy thả cảm xúc ❤️ vào tin nhắn này!`,
      mentions: [
        { tag: userName, id: senderID },
        { tag: matchedUserName, id: matchedUser.id }
      ],
      attachment: avatarUser && avatarMatched ? [
        fs.createReadStream(avatarUser),
        fs.createReadStream(avatarMatched)
      ] : []
    };

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "ghepdoi_confirmation",
        matched: matchedUser.id
      });
    }, messageID);
  }
};

module.exports.handleReaction = async function({ api, event, reaction, Users, Currencies }) {
  const { threadID, messageID, userID } = event;

  let existingReaction = global.client.handleReaction.find(r => 
    r.messageID === messageID && (r.author === userID || r.matched === userID)
  );

  if (!existingReaction || reaction !== '❤️') return;

  if (existingReaction.type === "ghepdoi_confirmation") {
    existingReaction.confirmed = existingReaction.confirmed || [];
    existingReaction.confirmed.push(userID);

    if (existingReaction.confirmed.length === 2) {
      let shopMessage = "💍 Cửa hàng nhẫn:\n\n";
      rings.forEach((ring, index) => {
        shopMessage += `${index + 1}. ${ring.emoji} ${ring.name}: ${ring.price.toLocaleString('vi-VN')} xu\n`;
      });
      shopMessage += "\nReply tin nhắn này với số thứ tự để chọn nhẫn cho cả hai người.";

      api.sendMessage(shopMessage, threadID, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: existingReaction.author,
          matched: existingReaction.matched,
          type: "choose_ring"
        });
      }, messageID);
    } else {
      api.sendMessage(`Một người đã đồng ý. Đang chờ người còn lại...`, threadID, messageID);
    }
  }
};

module.exports.handleReply = async function({ api, event, handleReply, Users, Currencies }) {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.type === "choose_ring") {
    const choose = parseInt(body) - 1;
    if (isNaN(choose) || choose < 0 || choose >= rings.length) {
      return api.sendMessage("Lựa chọn không hợp lệ!", threadID, messageID);
    }

    const ring = rings[choose];
    const user1 = handleReply.author;
    const user2 = handleReply.matched;
    const user1Money = (await Currencies.getData(user1)).money;

    if (user1Money < ring.price * 2) {
      return api.sendMessage(`Bạn không đủ tiền để mua ${ring.name} cho cả hai người. Cần ${(ring.price * 2).toLocaleString('vi-VN')} xu.`, threadID, messageID);
    }

    await Currencies.decreaseMoney(user1, ring.price * 2);

    userMarriages[user1] = user2;
    userMarriages[user2] = user1;
    happinessScores[user1] = 100;
    happinessScores[user2] = 100;
    userRings[user1] = ring;
    userRings[user2] = ring;
    saveData();

    const user1Name = await Users.getNameUser(user1);
    const user2Name = await Users.getNameUser(user2);

    const marriageMessage = `💍 Chúc mừng ${user1Name} và ${user2Name} đã kết hôn!\n` +
      `${user1Name} đã tặng ${ring.name} ${ring.emoji} cho cả hai người\n` +
      `Chúc hai bạn trăm năm hạnh phúc! 🎉👰🤵`;

    api.sendMessage(marriageMessage, threadID, messageID);
  }
};

module.exports.handleEvent = function({ api, event }) {
  const { threadID, senderID } = event;
  
  if (!threadID || senderID === api.getCurrentUserID()) return;

  if (!dailyInteractions[threadID]) dailyInteractions[threadID] = {};
  if (!dailyInteractions[threadID][senderID]) dailyInteractions[threadID][senderID] = 0;
  dailyInteractions[threadID][senderID]++;

  if (userMarriages[senderID]) {
    const partnerID = userMarriages[senderID];
    const partnerInteractions = dailyInteractions[threadID][partnerID] || 0;
    const userInteractions = dailyInteractions[threadID][senderID];

    let happinessChange = 0;
    if (userInteractions > 50 && partnerInteractions > 50) {
      happinessChange = 5;
    } else if (userInteractions < 10 || partnerInteractions < 10) {
      happinessChange = -3;
    }

    happinessScores[senderID] = Math.max(0, Math.min(100, (happinessScores[senderID] || 50) + happinessChange));
    happinessScores[partnerID] = Math.max(0, Math.min(100, (happinessScores[partnerID] || 50) + happinessChange));

    saveData();
  }
};

setInterval(() => {
  dailyInteractions = {};
  saveData();
}, 24 * 60 * 60 * 1000);

loadData();
