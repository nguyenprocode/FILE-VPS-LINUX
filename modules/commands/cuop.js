const fs = require('fs').promises;
const path = require('path');

const cc = 8; // Tỉ lệ thành công cơ bản
const maxLevelBonus = 30; // Tỷ lệ cộng thêm tối đa ở cấp độ cao nhất

module.exports.config = {
    name: "cuop",
    version: "1.5.1",
    hasPermssion: 0,
    usePrefix: false,
    credits: "Q.Huy (Enhanced by Gojo)",
    description: "Cướp tiền từ người khác với nhiều tính năng thú vị",
    commandCategory: "Game",
    usages: "@tag/reply | info | shop | buy <item>",
    cooldowns: 5
};

const items = {
    mask: { name: "Mặt nạ", price: 5000, successRateIncrease: 3 },
    gun: { name: "Súng", price: 10000, successRateIncrease: 5 },
    car: { name: "Xe thoát thân", price: 20000, successRateIncrease: 7 }
};

const randomEvents = [
    { 
        name: "Cảnh sát tuần tra",
        chance: 0.1,
        effect: (userData, stolenAmount) => {
            const fine = Math.floor(stolenAmount * 0.5);
            return `Bạn bị cảnh sát bắt gặp và phải nộp phạt ${fine}$!`;
        }
    },
    {
        name: "Gặp siêu trộm",
        chance: 0.05,
        effect: (userData) => {
            const expGain = 500;
            return `Bạn gặp một siêu trộm và học được vài chiêu mới! (+${expGain} EXP)`;
        }
    },
    {
        name: "Tìm thấy kho báu",
        chance: 0.03,
        effect: (userData) => {
            const treasureAmount = Math.floor(Math.random() * 10000) + 5000;
            return `Bạn tình cờ tìm thấy một kho báu nhỏ và nhận được ${treasureAmount}$!`;
        }
    }
];

function getTitle(level) {
    if (level < 5) return '🔰 Tập Sự';
    if (level < 10) return '🎓 Cướp Cấp 1';
    if (level < 15) return '🎓 Cướp Cấp 2';
    if (level < 20) return '🎓 Cướp Cấp 3';
    if (level < 25) return '🏅 Cướp Chuyên Nghiệp';
    if (level < 30) return '💎 Đạo Tặc';
    if (level < 35) return '💎 Đạo Tặc Lão Luyện';
    if (level < 40) return '🔮 Siêu Trộm';
    if (level < 45) return '🔮 Siêu Trộm Lão Luyện';
    if (level < 50) return '🎖️ Trộm Huyền Thoại';
    if (level < 55) return '🎖️ Trộm Thần Thoại';
    if (level < 60) return '🏆 Thánh Trộm';
    if (level < 65) return '🏆 Vua Trộm';
    if (level < 70) return '👑 Thần Trộm';
    if (level < 75) return '👑 Thần Trộm Lão Luyện';
    if (level < 80) return '🎭 Thánh Đạo Chích';
    if (level < 85) return '🎭 Vua Đạo Chích';
    if (level < 90) return '🎭 Thần Đạo Chích';
    if (level < 95) return '🎰 Huyền Thoại Đạo Chích';
    if (level < 100) return '🎰 Chúa Tể Đạo Chích';
    if (level < 105) return '🎰 Chúa Tể Đạo Tặc';
    if (level < 110) return '⚜️ Bá Chủ Trộm Cắp';
    if (level < 115) return '⚜️ Đệ Nhất Trộm Cắp';
    if (level < 120) return '⚜️ Đại Đệ Nhất Trộm Cắp';
    if (level < 125) return '🌟 Thánh Hoàng Trộm Cắp';
    if (level < 130) return '🌟 Ma Vương Đạo Chích';
    if (level < 135) return '🌟 Ma Đế Đạo Chích';
    if (level < 140) return '🔱 Thiên Vương Đạo Tặc';
    if (level < 145) return '🔱 Thiên Đế Đạo Tặc';
    if (level < 150) return '💀 Hắc Ám Đại Đạo Chích';
    if (level < 155) return '💀 Hắc Ám Đại Đạo Tặc';
    if (level < 160) return '👿 Hắc Ám Chi Vương';
    if (level < 165) return '👿 Hắc Ám Chi Đế';
    if (level < 170) return '🦹‍♂️ Siêu Cấp Đại Trộm';
    if (level < 175) return '🦹‍♂️ Vô Địch Đại Trộm';
    if (level < 180) return '⚔️ Trảm Tinh Đại Đạo';
    if (level < 185) return '⚔️ Phá Thiên Đại Đạo';
    if (level < 190) return '💣 Hủy Diệt Đại Đạo';
    if (level < 195) return '💣 Sáng Thế Đại Đạo';
    return '🔥 Chí Tôn Độc Tôn Đại Thánh';
}

const dataPath = path.join(__dirname, 'cuopData.json');

async function loadData() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return an empty object
            return {};
        }
        throw error;
    }
}

async function saveData(data) {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

async function getUserData(userId) {
    const data = await loadData();
    if (!data[userId]) {
        data[userId] = { exp: 0, level: 1, inventory: {}, lastRob: 0, stolen: 0, successStreak: 0, failStreak: 0 };
        await saveData(data);
    }
    return data[userId];
}

async function updateUserData(userId, updateFunction) {
    const data = await loadData();
    data[userId] = updateFunction(data[userId] || { exp: 0, level: 1, inventory: {}, lastRob: 0, stolen: 0, successStreak: 0, failStreak: 0 });
    await saveData(data);
    return data[userId];
}

module.exports.run = async function({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;

    let userData = await getUserData(senderID);
    let userMoney = await Currencies.getData(senderID);
    if (!userMoney) await Currencies.setData(senderID, { money: 0 });

    if (args[0] === "info" || (args.length === 0 && event.type !== "message_reply")) {
    let mention = Object.keys(event.mentions)[0];
    if (event.type == "message_reply") {
        mention = event.messageReply.senderID;
    }

    if (!mention) {
        const name = await Users.getNameUser(senderID);
        const level = userData.level || 1;
        const exp = userData.exp || 0;
        const money = (await Currencies.getData(senderID)).money || 0;
        const stolen = userData.stolen || 0;
        const title = getTitle(level);
        const inventory = userData.inventory || {};

        let itemList = "Các vật phẩm đang có:\n";
        for (const [item, quantity] of Object.entries(inventory)) {
            if (quantity > 0) {
                itemList += `- ${items[item].name}: ${quantity}\n`;
            }
        }

        return api.sendMessage(
            `Thông tin của bạn:\n` +
            `- Tên: ${name}\n` +
            `- Tiền: ${money}$\n` +
            `- Kinh nghiệm: ${exp}\n` +
            `- Cấp độ: ${level}\n` +
            `- Danh hiệu: "${title}"\n` +
            `- Số tiền đã cướp được: ${stolen}$\n\n` +
            itemList,
            threadID, messageID
        );
    } else {
        const targetData = await getUserData(mention);
        const name = await Users.getNameUser(mention);
        const level = targetData.level || 1;
        const exp = targetData.exp || 0;
        const money = (await Currencies.getData(mention)).money || 0;
        const stolen = targetData.stolen || 0;
        const title = getTitle(level);
        const inventory = targetData.inventory || {};

        let itemList = "Các vật phẩm đang có:\n";
        for (const [item, quantity] of Object.entries(inventory)) {
            if (quantity > 0) {
                itemList += `- ${items[item].name}: ${quantity}\n`;
            }
        }

        return api.sendMessage(
            `Thông tin của ${name}:\n` +
            `- Tiền: ${money}$\n` +
            `- Kinh nghiệm: ${exp}\n` +
            `- Cấp độ: ${level}\n` +
            `- Danh hiệu: "${title}"\n` +
            `- Số tiền đã bị cướp: ${stolen}$\n\n` +
            itemList,
            threadID, messageID
        );
    }
}

    if (args[0] === "shop") {
        let shopList = "Cửa hàng vật phẩm:\n";
        for (const [item, data] of Object.entries(items)) {
            shopList += `- ${data.name}: ${data.price}$ (Tăng tỉ lệ thành công ${data.successRateIncrease}%)\n`;
        }
        shopList += "\nĐể mua vật phẩm, sử dụng lệnh: cuop buy <tên vật phẩm>";
        return api.sendMessage(shopList, threadID, messageID);
    }

    if (args[0] === "buy") {
        const itemName = args.slice(1).join(" ").toLowerCase();
        const item = Object.entries(items).find(([key, value]) => value.name.toLowerCase() === itemName);
        if (!item) {
            return api.sendMessage("Vật phẩm không tồn tại trong cửa hàng!", threadID, messageID);
        }
        const [itemKey, itemData] = item;
        const userMoney = (await Currencies.getData(senderID)).money;
        if (userMoney < itemData.price) {
            return api.sendMessage(`Bạn không đủ tiền để mua ${itemData.name}!`, threadID, messageID);
        }
        await Currencies.decreaseMoney(senderID, itemData.price);
        userData = await updateUserData(senderID, (data) => {
            data.inventory[itemKey] = (data.inventory[itemKey] || 0) + 1;
            return data;
        });
        return api.sendMessage(`Bạn đã mua thành công ${itemData.name}!`, threadID, messageID);
    }

    let mention = Object.keys(event.mentions)[0];
    if (event.type == "message_reply") {
        mention = event.messageReply.senderID;
    }
    if (!mention) return api.sendMessage("Vui lòng tag hoặc reply tin nhắn của người bạn muốn cướp!", threadID, messageID);

    const targetData = await getUserData(mention);
    const targetMoney = (await Currencies.getData(mention)).money;
    const name2 = await Users.getNameUser(mention);

    if (userMoney.money < 1000) {
        return api.sendMessage("Bạn cần có ít nhất 1000$ để có thể cướp người khác!", threadID, messageID);
    }

    const cooldownTime = 5000; // 5 phút
    const lastRob = userData.lastRob || 0;
    const now = Date.now();
    if (now - lastRob < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - (now - lastRob)) / 60000);
        return api.sendMessage(`Bạn vừa cướp gần đây. Vui lòng đợi ${timeLeft} phút nữa.`, threadID, messageID);
    }

    let successRate = cc + Math.min((userData.level || 1) * 0.5, maxLevelBonus); // Giới hạn tỷ lệ cộng thêm ở 30%
    const inventory = userData.inventory || {};
    for (const [item, quantity] of Object.entries(inventory)) {
        if (quantity > 0) {
            successRate += items[item].successRateIncrease;
        }
    }

    const tile = Math.floor(Math.random() * 100) + 1;

    if (tile <= successRate) {
        const minSteal = Math.ceil(targetMoney * 0.01); // Ít nhất 1% tiền
        const maxSteal = Math.floor(targetMoney * 0.1); // Tối đa 10% tiền
        const stolenAmount = Math.floor(Math.random() * (maxSteal - minSteal + 1)) + minSteal;

        await Currencies.increaseMoney(senderID, stolenAmount);
        await Currencies.decreaseMoney(mention, stolenAmount);
        
        userData = await updateUserData(senderID, (data) => {
            data.exp += stolenAmount * 0.1; // Giảm exp nhận được
            data.stolen += stolenAmount;
            data.successStreak = (data.successStreak || 0) + 1;
            data.failStreak = 0;
            data.lastRob = now;
            return data;
        });

        let message = `Bạn đã cướp thành công ${stolenAmount}$ của ${name2} ╰(▔∀▔)╯`;

        if (userData.exp >= userData.level * 1000) {
            userData = await updateUserData(senderID, (data) => {
                data.level += 1;
                data.exp = 0;
                return data;
            });
            const title = getTitle(userData.level);
            api.sendMessage(`Chúc mừng, bạn đã lên cấp! Cấp độ hiện tại của bạn là ${userData.level} và bạn đã nhận được danh hiệu "${title}".`, threadID, messageID);
        }

        if (userData.successStreak % 5 === 0) {
            const bonus = userData.successStreak * 1000;
            await Currencies.increaseMoney(senderID, bonus);
            api.sendMessage(`Chúc mừng, bạn đã cướp thành công ${userData.successStreak} lần liên tiếp! Bạn nhận được thưởng ${bonus}$!`, threadID, messageID);
        }

        // Random event
        for (const event of randomEvents) {
            if (Math.random() < event.chance) {
                const eventMessage = event.effect(userData, stolenAmount);
                message += '\n' + eventMessage;
                if (event.name === "Cảnh sát tuần tra") {
                    const fine = Math.floor(stolenAmount * 0.5);
                    await Currencies.decreaseMoney(senderID, fine);
                } else if (event.name === "Tìm thấy kho báu") {
                    const treasureAmount = Math.floor(Math.random() * 10000) + 5000;
                    await Currencies.increaseMoney(senderID, treasureAmount);
                }
                break;
            }
        }

        return api.sendMessage(message, threadID, messageID);
    } else {
        const maxLoss = Math.floor(userMoney.money * 0.15); // Tăng tỷ lệ mất tiền lên 15%
        const lostAmount = Math.max(1, Math.floor(Math.random() * maxLoss) + 1);

        await Currencies.decreaseMoney(senderID, lostAmount);
        await Currencies.increaseMoney(mention, lostAmount);
        
        userData = await updateUserData(senderID, (data) => {
            data.failStreak = (data.failStreak || 0) + 1;
            data.successStreak = 0;
            data.lastRob = now;
            return data;
        });

        if (userData.failStreak % 3 === 0) {
            const penalty = userData.failStreak * 1000; // Tăng tiền phạt lên 1000$ mỗi 3 lần thất bại
            await Currencies.decreaseMoney(senderID, penalty);
            await Currencies.increaseMoney(mention, penalty); // Người bị cướp nhận được số tiền phạt
            api.sendMessage(`Rất tiếc, bạn đã thất bại trong việc cướp ${userData.failStreak} lần liên tiếp! Bạn bị phạt ${penalty}$ và số tiền này được chuyển cho ${name2}!`, threadID, messageID);
        }

        // Xử lý mất đồ khi thất bại
        if (inventory && Object.keys(inventory).length > 0) {
            const itemsWithQuantity = Object.entries(inventory).filter(([_, quantity]) => quantity > 0);
            if (itemsWithQuantity.length > 0) {
                const [lostItem, quantity] = itemsWithQuantity[Math.floor(Math.random() * itemsWithQuantity.length)];
                userData = await updateUserData(senderID, (data) => {
                    data.inventory[lostItem] -= 1;
                    return data;
                });
                api.sendMessage(`Bạn đã làm mất 1 ${items[lostItem].name} trong quá trình cướp!`, threadID, messageID);
            }
        }

        return api.sendMessage(`Bạn đã cướp ${name2} thất bại và mất ${lostAmount}$. Số tiền này được chuyển cho ${name2} ಡ ͜ ʖ ಡ`, threadID, messageID);
    }
};