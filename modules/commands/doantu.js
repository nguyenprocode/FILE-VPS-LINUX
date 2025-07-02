const entryFee = 500; // Phí tham gia trò chơi
const maxPoints = 15; // Điểm tối đa
const minPoints = 5; // Điểm tối thiểu
const timeLimit = 300000; // Thời gian giới hạn (5 phút)
const fs = require('fs').promises;
const path = require('path');


const clearWords = async (args, send, api) => {
    if (args.length < 2) {
      send(`❎ Bạn cần cung cấp thêm đối số cho lệnh clear.`);
      return;
    }
    let responseMessage = '';
    if (args[1] === "all") {
      await writeWords([]); 
      responseMessage = `✅ Đã xóa tất cả từ khỏi dữ liệu.`;
    } else if (args[1] === "top") {
      await writeLeaderboard([]); 
      responseMessage = `✅ Đã xóa bảng xếp hạng.`;
    } else {
      const keywordsToDelete = args.slice(1).join(' ').split(',');
      let deletedWords = [];
      let notFoundWords = [];
      const wordsList = await readWords(); 
      keywordsToDelete.forEach(keyword => {
        const index = wordsList.findIndex(word => word.trim().toLowerCase() === keyword.trim().toLowerCase());
        if (index !== -1) {
          deletedWords.push(wordsList[index]);
          wordsList.splice(index, 1);
        } else {
          notFoundWords.push(keyword);
        }
      });
      await writeWords(wordsList); 
      if (deletedWords.length > 0) {
        responseMessage += `✅ Đã xóa từ: ${deletedWords.join(', ')}\n`;
      }
      if (notFoundWords.length > 0) {
        responseMessage += `❎ Không tìm thấy các từ sau để xóa: ${notFoundWords.join(', ')}`;
      }
    }
    send(responseMessage.trim());
  };
const shuffle = (word) => {
  let arr = word.split(' ');
  for (let i = 0; i < arr.length; i++) {
    let subArr = arr[i].split('');
    for (let j = subArr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [subArr[j], subArr[k]] = [subArr[k], subArr[j]];
    }
    arr[i] = subArr.join('');
  }
  return arr.join(' ');
};




const addWords = async (args) => {
    const wordsList = await readWords();
    const newWords = args.slice(1).join(' ').split(',').map(word => word.trim()).filter(word => word.length > 0);
    if (newWords.length === 0) {
      throw new Error(`❎ Bạn cần nhập các từ mới để thêm, cách nhau bằng dấu phẩy`);
    }
    let addedWords = [];
    let existingWords = [];
    newWords.forEach(newWord => {
      if (wordsList.includes(newWord)) {
        existingWords.push(newWord);
      } else {
        wordsList.push(newWord);
        addedWords.push(newWord);
      }
    });
    await writeWords(wordsList);
    let responseMessage = '';
    if (addedWords.length > 0) {
      responseMessage += `✅ Đã thêm từ mới: ${addedWords.join(', ')}\n`;
    }
    if (existingWords.length > 0) {
      responseMessage += `❎ Các từ đã tồn tại: ${existingWords.join(', ')}`;
    }
    return responseMessage.trim();
  };
const dataPath = path.resolve(__dirname, 'data');
const wordsFilePath = path.join(dataPath, 'words.json');
const leaderboardPath = path.join(dataPath, 'leaderboard.json');
let wordsCache = null;
let leaderboardCache = null;
const readFileCached = async (filePath, cache) => {
  if (cache) return cache;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    cache = JSON.parse(data);
  } catch (error) {
    cache = [];
  }
  return cache;
};
const writeFileCached = async (filePath, data, cache) => {
  cache = data;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
const readWords = async () => readFileCached(wordsFilePath, wordsCache);
const writeWords = async (words) => writeFileCached(wordsFilePath, words, wordsCache);
const readLeaderboard = async () => readFileCached(leaderboardPath, leaderboardCache);
const writeLeaderboard = async (leaderboard) => writeFileCached(leaderboardPath, leaderboard, leaderboardCache);
module.exports = {
  config: {
    name: "doantu",
    version: "1.0.0",
    credits: "DongDev",
    hasPermssion: 0,
    description: "Giải mã từ vựng tiếng Việt!",
    commandCategory: "Game",
    usages: "words",
    cooldowns: 5,
  },
  onLoad: async () => {
    try {
      await fs.mkdir(dataPath, { recursive: true });
      await readWords();
      await readLeaderboard();
    } catch (error) {
      console.error('Error initializing game data:', error);
    }
  },
  run: async ({ event, api, Currencies, Users, args }) => {
    const { senderID, threadID, messageID } = event;
    let send = (msg, callback) => api.sendMessage(msg, threadID, callback, messageID);
    try {
      const wordsList = await readWords(); 
      switch (args[0]) {
        case "top":
        case "lb":
          send(await getLeaderboard());
          break;
        case "check":
          send(`📚 Hiện có ${wordsList.length} từ trong dữ liệu.`);
          break;
        case "add":
          if (event.senderID != 61568252515454) {
          return api.sendMessage(`⚠️ Bạn không được phép sử dụng lệnh này`, event.threadID, event.messageID);
        }
          send(await addWords(args));
          break;
        case "clear":
          if (event.senderID != 61568252515454) {
            return api.sendMessage(`⚠️ Bạn không được phép sử dụng lệnh này`, event.threadID, event.messageID);
        }
          await clearWords(args, send, api);
          break;
        default:
          const userData = await Currencies.getData(senderID);
          if (userData.money < entryFee) {
            return send(`❎ Bạn không có đủ tiền để tham gia trò chơi. Phí tham gia là ${entryFee.toLocaleString()}$`);
          }
          if (wordsList.length === 0) {
            return send(`❎ Hiện tại không có từ nào để chơi. Vui lòng thử lại sau.`);
          }
          const word = wordsList[Math.floor(Math.random() * wordsList.length)];
          const wordLength = word.length;
          const scrambled = shuffle(word).toUpperCase().split('').join(' ');
          send(`
🔠 Game giải mã từ khóa!
➣ Từ khóa: ${scrambled}
  ➛ Có ${wordLength} chữ
➣ Nhắn Hint hoặc gợi ý để xem gợi ý
➣ Bạn sẽ có thời gian là 5 phút để giải mã từ`, (err, info) => {
            if (!global.client.giaiMaGame) global.client.giaiMaGame = {};
            global.client.giaiMaGame[threadID] = {
              originalWord: word,
              scrambledWord: scrambled,
              messageID: info.messageID,
              userID: senderID,
              hints: 0,
              maxHints: 3,
              revealedLetters: new Set(),
              attempts: 0,
              startTime: Date.now()
            };
            setTimeout(async () => {
              if (global.client.giaiMaGame[threadID]) {
                let name = await Users.getNameUser(senderID);
                send({
                  body: `⏳ Hết thời gian! ${name} đã không kịp giải mã từ: ${global.client.giaiMaGame[threadID].originalWord}`,
                  mentions: [{ tag: name, id: senderID }]
                });
                delete global.client.giaiMaGame[threadID];
              }
            }, timeLimit);
          });
          break;
      }
    } catch (error) {
      console.error('Error during game run:', error);
      send(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau.`);
    }
  },
  handleEvent: async ({ event, api, Currencies, Users }) => {
    const { threadID, body, senderID , messageID} = event;
let send = (msg, callback) => api.sendMessage(msg, threadID, callback, messageID);
    if (!global.client.giaiMaGame || !global.client.giaiMaGame[threadID]) return;
    const gameData = global.client.giaiMaGame[threadID];
    //if (senderID !== gameData.userID) return;
    const botID = api.getCurrentUserID();
  if (senderID === botID) return;
    
    try {
      if (body.toLowerCase().trim() === "off") {
        send(`❌ Trò chơi đã dừng ${await Users.getNameUser(senderID)}`);
        delete global.client.giaiMaGame[threadID];
        return;
    }
      gameData.attempts++;
      if (body.toLowerCase().trim() === "gợi ý" || body.toLowerCase().trim() === "hint") {
        // Kiểm tra nếu đã hết số lần gợi ý cho phép
        if (gameData.hints >= gameData.maxHints) {
            return send(`❎ Bạn đã sử dụng hết số lần gợi ý!`);
        }
    
        // Xác định số lần gợi ý và số chữ cái cần được gợi ý
        let hintFee = 500; 
        let revealCount = 1; // Mặc định gợi 1 chữ cái
        if (gameData.hints === 1) {
            hintFee = 750;
            revealCount = 1; // Lần 2 gợi thêm 1 chữ cái
        } else if (gameData.hints === 2) {
            hintFee = 1000;
            revealCount = 2; // Lần 3 gợi 2 chữ cái
        }
    
        // Phí gợi ý cố định là 100,000$
        //const hintFee = 1000;
        const userData = await Currencies.getData(senderID);
    
        // Kiểm tra nếu người chơi không đủ tiền để gợi ý
        if (userData.money < hintFee) {
            return send(`❎ Bạn không có đủ tiền để nhận gợi ý. Phí gợi ý là 100,000$`);
        }
    
        // Trừ tiền và tăng số lần gợi ý
        await Currencies.decreaseMoney(senderID, hintFee);
        gameData.hints++;
    
        // Lấy danh sách các chữ cái chưa được gợi
        const wordArr = gameData.originalWord.split('');
        let availableIndexes = [];
        for (let i = 0; i < wordArr.length; i++) {
            if (!gameData.revealedLetters.has(i)) {
                availableIndexes.push(i);
            }
        }
    
        // Nếu số lượng chữ cái còn lại ít hơn số lần gợi ý, chỉ gợi số lượng có sẵn
        revealCount = Math.min(revealCount, availableIndexes.length);
    
        // Lấy ngẫu nhiên các chỉ số để gợi ý
        for (let i = 0; i < revealCount; i++) {
            const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
            gameData.revealedLetters.add(randomIndex);
            availableIndexes = availableIndexes.filter(index => index !== randomIndex); // Loại bỏ chỉ số đã được gợi
        }
    
        // Tạo chuỗi hiển thị cho gợi ý
        let revealed = '';
        wordArr.forEach((char, index) => {
            if (gameData.revealedLetters.has(index)) {
                revealed += `${char} `;
            } else {
                revealed += `_ `;
            }
        });
    
        // Thông báo số lần gợi ý còn lại và chi tiết gợi ý
        const hintsRemaining = gameData.maxHints - gameData.hints;
        send(`📝 Gợi ý của bạn: ${revealed.trim()}\n💸 Bạn bị trừ: ${hintFee.toLocaleString()}$\n💡 Gợi ý còn lại: ${hintsRemaining}`);
    } else if (body.toLowerCase().trim() === "bỏ qua" || body.toLowerCase().trim() === "skip") {
  try {
    const gameData = global.client.giaiMaGame[threadID];
    if (!gameData) {
      return send(`❎ Hiện tại không có trò chơi nào đang diễn ra.`);
    }
    const skippedWord = gameData.originalWord;
    delete global.client.giaiMaGame[threadID];
    const skipFee = Math.ceil(entryFee * 5);
    const remainingMoney = await Currencies.getData(senderID);
    if (remainingMoney.money < skipFee || skipFee <= 0) {
      return send(`❎ Bạn không có đủ tiền để bỏ qua từ này.`);
    }
    await Currencies.decreaseMoney(senderID, skipFee);
    send(`
❌ Bạn đã bỏ qua từ "${skippedWord}"
➣ Bắt đầu chuyển đổi từ mới
➣ Sẽ bắt đầu sau 3 giây...`, async (err, info) => {
  const countdown = ["2", "1", "0"];
  countdown.forEach((item, index) => {
    setTimeout(() => {
      api.sendMessage(info.messageID, `❌ Bạn đã bỏ qua từ "${skippedWord}", đang tải từ mới, bắt đầu sau ${2 - index} giây...`);
    }, (index + 1) * 1000);
  });
  setTimeout(async () => {
    try {
      const words = await readWords();
      if (words.length === 0) {
        return send(`❎ Hiện tại không có từ nào để chơi. Vui lòng thử lại sau.`);
      }
      const word = words[Math.floor(Math.random() * words.length)]; 
      const wordLength = word.length;
      const scrambled = shuffle(word).toUpperCase().split('').join(' ');
      send(`
🔄 Bắt đầu từ mới!
💸 Bạn đã mất ${skipFee.toLocaleString()}$ (5% của ${entryFee.toLocaleString()}$) để bỏ qua từ này.
➣ Từ khóa: ${scrambled}
   ➛ Có ${wordLength} chữ
➣ Nhắn hint để gợi ý (- 1000)
➣ Bạn sẽ có thời gian là 5 phút để giải mã từ`, async (err, newInfo) => {
        if (err) return;
        if (!global.client.giaiMaGame) global.client.giaiMaGame = {};
        global.client.giaiMaGame[threadID] = {
          originalWord: word,
          scrambledWord: scrambled,
          messageID: newInfo.messageID,
          userID: senderID,
          hints: 0,
          maxHints: 3,
          revealedLetters: new Set(),
          attempts: 0,
          startTime: Date.now()
        };
        setTimeout(async () => {
          if (global.client.giaiMaGame[threadID]) {
            let name = await Users.getNameUser(senderID);
           send({
              body: `⏳ Hết thời gian!\n${name} đã không kịp giải\n Từ khóa: ${global.Seiko.giaiMaGame[threadID].originalWord}`,
              mentions: [{ tag: name, id: senderID }]
            });
            delete global.client.giaiMaGame[threadID];
          }
        }, timeLimit);
      });
      await api.unsendMessage(info.messageID);
    } catch (error) {
      console.error('Error starting new word:', error);
      send(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau.`);
    }
  }, 3000);
});
  } catch (error) {
    console.error('Error when skipping word:', error);
    send(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau.`);
  }
      } else if (body.toLowerCase().trim() === gameData.originalWord.toLowerCase().trim()) {
        const timeTaken = Date.now() - gameData.startTime;
        const reward = 1500; // Fixed reward amount
        const points = Math.ceil(Math.max(minPoints, maxPoints - ((gameData.attempts - 1) * ((maxPoints - minPoints) / (gameData.originalWord.length - 1)))));

        await Currencies.increaseMoney(senderID, reward);
        let name = await Users.getNameUser(senderID);
        let leaderboard = await readLeaderboard();
        let existingUser = leaderboard.find(user => user.userID === senderID);

        if (existingUser) {
            existingUser.reward += reward;
            existingUser.points += points;
        } else {
            leaderboard.push({ userID: senderID, name, reward, points });
        }
        leaderboard.sort((a, b) => b.points - a.points);
        leaderboard = leaderboard.slice(0, 10);
        await writeLeaderboard(leaderboard);

        send(`${name} đã giải mã thành công.
➣ Top ${leaderboard.findIndex(user => user.userID === senderID) + 1} giải mã        
➣ Từ khóa:\"${gameData.originalWord}\"
➣ Sau ${gameData.attempts} lần đoán.
➣ Thời gian trả lời: ${Math.floor(timeTaken / 1000)} giây
💰 Đã cộng ${reward.toLocaleString()}$ vào tài khoản.
🪙 Được cộng ${points} điểm.
  ➣ Tổng điểm: ${existingUser ? existingUser.points : points}`);

        delete global.client.giaiMaGame[threadID];

      } else {
        const userName = await Users.getNameUser(senderID);
      send({
        body: `❎ ${userName}, bạn đã đoán sai! Hãy thử lại.`,
        mentions: [{ tag: userName, id: senderID }]
      });
    }

    } catch (error) {
      console.error('Error during game event:', error);
     send(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau.`);
    }
  }
};
const getLeaderboard = async () => {
    const leaderboard = await readLeaderboard();
    if (leaderboard.length === 0) {
      return "Bảng xếp hạng hiện đang trống!";
    }
  
    const header = "🏆 Bảng xếp hạng game Words Cramble\n";
  
    const leaderboardText = leaderboard.map((user, index) => {
      let medal;
      switch (index) {
        case 0:
          medal = "🥇";
          break;
        case 1:
          medal = "🥈";
          break;
        case 2:
          medal = "🥉";
          break;
        default:
          medal = `${index + 1}`;
          break;
      }
  
      return `${medal}. Top ${index + 1}: ${user.name}
      ➛ Tổng điểm: ${user.points}
      ➛ Tổng số tiền: ${user.reward.toLocaleString()} $`;
    }).join('\n');
  
    return header + leaderboardText;
  };
  // Hàm xử lý sự kiện cảm xúc
handleReaction: async ({ event, api }) => {
  const { threadID, messageID, userID } = event;

  // Kiểm tra xem có trò chơi đang diễn ra không
  if (!global.client.giaiMaGame || !global.client.giaiMaGame[threadID]) return;

  const gameData = global.client.giaiMaGame[threadID];

  // Kiểm tra xem người dùng có phải là người đã giải mã từ không
  //if (userID !== gameData.userID) return;

  // Kiểm tra xem tin nhắn có phải là tin nhắn đã giải mã từ không
  if (messageID !== gameData.messageID) return;

  // Bắt đầu từ mới
  startNewWord(threadID, api);
};
