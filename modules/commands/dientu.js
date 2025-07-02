const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dientu",
    version: "1.8.0",
    hasPermssion: 0,
    credits: "Gojo Satoru thay cre làm chó",
    description: "Trò chơi Điền vào chỗ trống.",
    commandCategory: "Game",
    usages: "[/add/bxh]",
    cooldowns: 5
};

const SENTENCES_FILE = path.join(__dirname, "game", "dientu", "sentences.json");
const LEADERBOARD_FILE = path.join(__dirname, "game", "dientu", "leaderboard.json");
const DEFAULT_SENTENCES = [
    "Công cha như núi thái sơn nghĩa mẹ như nước trong nguồn chảy ra",
    "Có công mài sắt có ngày nên kim",
    "Một con ngựa đau cả tàu bỏ cỏ",
    "Kiến tha lâu cũng mỏi cẳng",
    "Học thầy không tày học bạn",
    "Ăn quả nhớ kẻ trồng cây",
    "Uống nước nhớ nguồn",
    "Bầu ơi thương lấy bí cùng, tuy rằng khác giống nhưng chung một giàn",
    "Gần mực thì đen gần đèn thì cháy",
    "Không thầy đố mày làm nên"
];

let sentences = [];
let leaderboard = {};
loadData();

let gameData = {};

const TIME_THOIGIAN = 120000; 
const THUONG_GOC = 1000;
const BONUS_FACTOR = 100;
const IT_NHAT = 100;

function loadData() {
    try {
        sentences = fs.readJsonSync(SENTENCES_FILE);
    } catch (error) {
        sentences = DEFAULT_SENTENCES;
        saveSentences();
    }

    try {
        leaderboard = fs.readJsonSync(LEADERBOARD_FILE);
    } catch (error) {
        leaderboard = {};
        saveLeaderboard();
    }
}

function saveSentences() {
    fs.writeJsonSync(SENTENCES_FILE, sentences);
}

function saveLeaderboard() {
    fs.writeJsonSync(LEADERBOARD_FILE, leaderboard);
}

function chooseRandomSentence() {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    const words = sentence.split(' ');
    const hiddenWords = [];

    for (let i = 0; i < 2; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * words.length);
        } while (hiddenWords.includes(words[randomIndex]));
        hiddenWords.push(words[randomIndex]);
        words[randomIndex] = '___';
    }

    const modifiedSentence = words.join(' ');
    return { sentence: modifiedSentence, answer: hiddenWords };
}

module.exports.handleEvent = async function({ api, event, Currencies }) {

    const { threadID, senderID, body } = event;

    if (senderID === api.getCurrentUserID()) return;

    if (!gameData[threadID]) return;

    const game = gameData[threadID];

    const userAnswer = body.toLowerCase();

    const correctAnswer = game.answer.map(word => word.toLowerCase());

    if (userAnswer === "end" || userAnswer === "quit") {

        api.sendMessage(

            `🎮 Trò chơi đã kết thúc.\n` +

            `Câu trả lời đúng là: ${game.answer.join(", ")}\n` +

            `Câu đầy đủ: ${game.sentence.replace(/___/g, () => game.answer.shift())}`,

            threadID

        );

        delete gameData[threadID];

        return;

    }

    if (correctAnswer.every(word => userAnswer.includes(word))) {

        const timeTaken = (Date.now() - game.startTime) / 1000;

        const timeBonus = Math.max(0, BONUS_FACTOR - Math.floor(timeTaken));

        const finalReward = Math.max(IT_NHAT, THUONG_GOC + timeBonus);

        try {

            await Currencies.increaseMoney(senderID, finalReward);

            const userData = await api.getUserInfo(senderID);

            const userName = userData[senderID].name;
            if (!leaderboard[senderID]) {
                leaderboard[senderID] = {
                    name: userName,
                    score: 0
                };
            }
            leaderboard[senderID].score += finalReward;
            saveLeaderboard();
            api.sendMessage(
                `🎉 Chúc mừng! ${userName} đã trả lời đúng và nhận được ${finalReward} đồng.\n` +
                `Câu đầy đủ: ${game.sentence.replace(/___/g, () => game.answer.shift())}`,
                threadID
            );
            delete gameData[threadID];
        } catch (error) {
            console.error("Error getting user info or increasing money:", error);
            api.sendMessage("Đã xảy ra lỗi khi lấy thông tin người dùng hoặc tăng tiền thưởng. Vui lòng thử lại sau.", threadID);
        }
    } else {
        api.sendMessage(`❌ Rất tiếc, "${body}" không phải là câu trả lời đúng. Hãy thử lại!`, threadID);
    }
};
module.exports.run = async function({ api, event, args, permssion }) {
    const { threadID, senderID } = event;

    if (!args[0]) {
        if (gameData[threadID]) {
            return api.sendMessage("Đã có một câu hỏi đang chờ trả lời trong nhóm này.", threadID);
        }

        const { sentence, answer } = chooseRandomSentence();
        gameData[threadID] = {
            sentence,
            answer,
            startTime: Date.now()
        };

        api.sendMessage(
            `🎮 Trò chơi Điền vào chỗ trống đã bắt đầu!\n\n` +
            `Câu hỏi: ${sentence}\n\n` +
            `Hãy chat trực tiếp câu trả lời của bạn (gồm 2 từ bị ẩn cách nhau bởi dấu phẩy).`,
            threadID
        );

        setTimeout(() => {
            if (gameData[threadID]) {
                api.sendMessage(
                    `⏱ Hết thời gian!\n` +
                    `Câu trả lời đúng là: ${gameData[threadID].answer.join(", ")}\n` +
                    `Câu đầy đủ: ${gameData[threadID].sentence.replace(/___/g, (match, index) => gameData[threadID].answer[index])}`,
                    threadID
                );
                delete gameData[threadID];
            }
        }, TIME_THOIGIAN);

        return;
    }

    if (args[0] === "add") {
        if (event.senderID != 61568252515454) {
            return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID);
        }

        const newSentence = args.slice(1).join(" ");
        if (newSentence.length < 10) {
            return api.sendMessage("Câu mới phải có ít nhất 10 ký tự.", threadID);
        }
        sentences.push(newSentence);
        saveSentences();
        return api.sendMessage("Câu mới đã được thêm vào danh sách.", threadID);
    }

    if (args[0] === "bxh") {
        const sortedLeaderboard = Object.entries(leaderboard)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 10);

        if (sortedLeaderboard.length === 0) {
            return api.sendMessage("Hiện tại chưa có dữ liệu bảng xếp hạng.", threadID);
        }

        const leaderboardMessage = "🏆 Bảng xếp hạng top 10:\n\n" +
            sortedLeaderboard.map(([userID, userData], index) => `${index + 1}. ${userData.name} - ${userData.score} đồng`).join("\n");

        return api.sendMessage(leaderboardMessage, threadID);
    }

    return api.sendMessage("Lệnh không hợp lệ. Vui lòng sử dụng 'dientu' để bắt đầu trò chơi, 'add' để thêm câu mới (cần quyền admin) hoặc 'bxh' để xem bảng xếp hạng.", threadID);
};