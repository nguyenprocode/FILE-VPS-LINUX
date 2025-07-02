const fs = require('fs').promises;
const path = require('path');

module.exports.config = {
    name: "farm",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Gojo Satoru",
    description: "Trồng cây, chăn nuôi và nấu ăn",
    commandCategory: "Game",
    usages: "[trong/thuhoach/choan/nauan/info/kho/ban/level/bxh]",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 300000
    }
};

// Đường dẫn đến file lưu dữ liệu
const DATA_FILE_PATH = path.join(__dirname, 'game', 'farmGameData.json');

// Khai báo biến toàn cục
let playerData = {};
let plantSchema = {};
let cooldowns = {};
let inventory = {};
let cookingActivities = {};

// Định nghĩa các loại cây trồng
const CROPS = {
    "ot": { emoji: "🌶️", name: "Ớt", growTime: 1200000, yield: [2, 6], price:2500, exp: 15 },
    "ngo": { emoji: "🌽", name: "Ngô", growTime: 1200000, yield: [2, 6], price: 2500, exp: 15 },
    "khoaitay": { emoji: "🥔", name: "Khoai tây", growTime: 1800000, yield: [2, 5], price: 5000, exp: 30 },
    "caingot": { emoji: "🥬", name: "Cải ngọt", growTime: 1800000, yield: [2, 5], price: 5000, exp: 30 },
    "dautay": { emoji: "🍓", name: "Dâu tây", growTime: 3600000, yield: [2, 4], price: 10000, exp: 50 },
    "lua_gao": { emoji: "🌾", name: "Lúa gạo", growTime: 3600000, yield: [3, 6], price: 3000, exp: 20 },
    "hanh": { emoji: "🧅", name: "Hành", growTime: 1800000, yield: [2, 5], price: 2000, exp: 15 },
    "rau_xa_lach": { emoji: "🥬", name: "Rau xà lách", growTime: 2400000, yield: [2, 4], price: 2500, exp: 18 },
    "dua_chuot": { emoji: "🥒", name: "Dưa chuột", growTime: 2700000, yield: [2, 5], price: 2800, exp: 20 },
    "ca_chua": { emoji: "🍅", name: "Cà chua", growTime: 3300000, yield: [2, 5], price: 3000, exp: 25 },
    "chuoi": { emoji: "🍌", name: "Chuối", growTime: 5400000, yield: [3, 6], price: 3500, exp: 28 },
    "dua_hau": { emoji: "🍉", name: "Dưa hấu", growTime: 7200000, yield: [1, 3], price: 10000, exp: 60 },
    "nho": { emoji: "🍇", name: "Nho", growTime: 6000000, yield: [2, 5], price: 8000, exp: 45 },
    "khoai_lang": { emoji: "🍠", name: "Khoai lang", growTime: 3000000, yield: [2, 4], price: 4000, exp: 25 },
    "dau_dua": { emoji: "🥥", name: "Dừa", growTime: 10800000, yield: [1, 2], price: 15000, exp: 75 }
};

// Định nghĩa các loại động vật
const ANIMALS = {
    "bo": { 
        emoji: "🐄", name: "Bò", feedTime: 14400000, feedCost: 500, 
        products: {
            "sua": { name: "Sữa", emoji: "🥛", yield: [2, 4], price: 400 },
            "thit_bo": { name: "Thịt bò", emoji: "🥩", yield: [1, 2], price: 8000 }
        },
        exp: 60 
    },
    "ga": { 
        emoji: "🐔", name: "Gà", feedTime: 7200000, feedCost: 300, 
        products: {
            "trung": { name: "Trứng", emoji: "🥚", yield: [2, 5], price: 200 },
            "thit_ga": { name: "Thịt gà", emoji: "🍗", yield: [1, 2], price: 5000 }
        },
        exp: 40 
    },
    "heo": { 
        emoji: "🐷", name: "Heo", feedTime: 10800000, feedCost: 400, 
        products: {
            "thit_heo": { name: "Thịt heo", emoji: "🍖", yield: [2, 4], price: 6000 }
        },
        exp: 50 
    },
    "cuu": {
        emoji: "🐑", name: "Cừu", feedTime: 12600000, feedCost: 450,
        products: {
            "len": { name: "Len", emoji: "🧶", yield: [1, 3], price: 700 },
            "thit_cuu": { name: "Thịt cừu", emoji: "🍖", yield: [1, 2], price: 7500 }
        },
        exp: 55
    },
    "vit": {
        emoji: "🦆", name: "Vịt", feedTime: 9000000, feedCost: 350,
        products: {
            "trung_vit": { name: "Trứng vịt", emoji: "🥚", yield: [2, 4], price: 2500 },
            "thit_vit": { name: "Thịt vịt", emoji: "🍗", yield: [1, 2], price: 5500 }
        },
        exp: 45
    },
    "de": {
        emoji: "🐐", name: "Dê", feedTime: 13200000, feedCost: 475,
        products: {
            "sua_de": { name: "Sữa dê", emoji: "🥛", yield: [2, 3], price: 4500 },
            "thit_de": { name: "Thịt dê", emoji: "🍖", yield: [1, 2], price: 7000 }
        },
        exp: 58
    }
};

// Định nghĩa các công thức nấu ăn
const RECIPES = {
    "banh_mi": {
        name: "Bánh mì",
        emoji: "🥖",
        ingredients: { "lua_gao": 2, "trung": 1 },
        cookTime: 600000, // 10 phút
        price: 10000,
        exp: 50
    },
    "pho_bo": {
        name: "Phở bò",
        emoji: "🍜",
        ingredients: { "lua_gao": 2, "thit_bo": 1, "hanh": 1 },
        cookTime: 1800000, // 30 phút
        price: 20000,
        exp: 100
    },
    "com_ga": {
        name: "Cơm gà",
        emoji: "🍗🍚",
        ingredients: { "lua_gao": 1, "thit_ga": 1 },
        cookTime: 1200000, // 20 phút
        price: 15000,
        exp: 75
    },
    "salad": {
        name: "Salad",
        emoji: "🥗",
        ingredients: { "rau_xa_lach": 2, "ca_chua": 1, "dua_chuot": 1 },
        cookTime: 600000, // 10 phút
        price: 10000,
        exp: 50
    },
    "banh_xeo": {
        name: "Bánh xèo",
        emoji: "🥞",
        ingredients: { "lua_gao": 1, "thit_heo": 1, "dau_dua": 1 },
        cookTime: 900000, // 15 phút
        price: 13000,
        exp: 65
    },
    "smoothie_trai_cay": {
        name: "Smoothie trái cây",
        emoji: "🥤",
        ingredients: { "dautay": 2, "chuoi": 1, "sua": 1 },
        cookTime: 300000, // 5 phút
        price: 8000,
        exp: 40
    },
    "thit_kho_trung": {
        name: "Thịt kho trứng",
        emoji: "🍲",
        ingredients: { "thit_heo": 1, "trung": 2, "dua_chuot": 1 },
        cookTime: 2400000, // 40 phút
        price: 18000,
        exp: 90
    },
    "ga_nuong": {
        name: "Gà nướng",
        emoji: "🍗",
        ingredients: { "thit_ga": 1, "ot": 1, "hanh": 1 },
        cookTime: 1800000, // 30 phút
        price: 16000,
        exp: 80
    },
    "canh_chua": {
        name: "Canh chua",
        emoji: "🥣",
        ingredients: { "ca_chua": 2, "dua_chuot": 1, "ngo": 1 },
        cookTime: 1500000, // 25 phút
        price: 12000,
        exp: 60
    },
    "trai_cay_dam": {
        name: "Trái cây dầm",
        emoji: "🍨",
        ingredients: { "dautay": 1, "nho": 1, "dua_hau": 1, "sua": 1 },
        cookTime: 600000, // 10 phút
        price: 11000,
        exp: 55
    }
};

// Hàm để lưu tất cả dữ liệu game
async function saveAllData() {
    const gameData = {
        playerData,
        plantSchema,
        cooldowns,
        inventory,
        cookingActivities,
        lastResetDate: global.farmData.lastResetDate,
        lastUpdated: Date.now()
    };

    try {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(gameData, null, 2));
        console.log('Đã lưu dữ liệu game thành công.');
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu game:', error);
    }
}

// Hàm để tải tất cả dữ liệu game
async function loadAllData() {
    try {
        const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
        const gameData = JSON.parse(data);

        playerData = gameData.playerData || {};
        plantSchema = gameData.plantSchema || {};
        cooldowns = gameData.cooldowns || {};
        inventory = gameData.inventory || {};
        cookingActivities = gameData.cookingActivities || {};
        global.farmData = { lastResetDate: gameData.lastResetDate };

        console.log('Đã tải dữ liệu game thành công.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Không tìm thấy file dữ liệu. Tạo dữ liệu mới.');
            global.farmData = { lastResetDate: new Date().toDateString() };
        } else {
            console.error('Lỗi khi tải dữ liệu game:', error);
        }
    }
}

// Khởi tạo dữ liệu khi khởi động module
loadAllData();

// Các hàm tiện ích
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours} giờ ${minutes % 60} phút`;
    } else if (minutes > 0) {
        return `${minutes} phút`;
    } else {
        return `${seconds} giây`;
    }
}

function calculateLevel(exp) {
    return Math.floor(Math.sqrt(exp / 100)) + 1;
}
// Hàm trồng cây
async function plantAllCrops(api, event, uid, Currencies) {
    if (!playerData[uid]) {
        playerData[uid] = { exp: 0, level: 1 };
    }
    
    const userMoney = await Currencies.getData(uid);
    let totalCost = 0;
    let cropsToPlant = [];

    for (let cropName in CROPS) {
        if (!plantSchema[uid] || !plantSchema[uid][cropName]) {
            if (userMoney.money >= CROPS[cropName].price + totalCost) {
                cropsToPlant.push(cropName);
                totalCost += CROPS[cropName].price;
            }
        }
    }

    if (cropsToPlant.length === 0) {
        return api.sendMessage(`💰 Bạn không đủ tiền để trồng thêm cây nào.`, event.threadID);
    }

    await Currencies.decreaseMoney(uid, totalCost);
    if (!plantSchema[uid]) plantSchema[uid] = {};

    let plantedMessage = `🌱 Đã trồng thành công ${cropsToPlant.length} loại cây:\n\n`;
    for (let crop of cropsToPlant) {
        plantSchema[uid][crop] = { 
            plantedTime: Date.now(),
            growTime: CROPS[crop].growTime
        };
        const [minYield, maxYield] = CROPS[crop].yield;
        const avgYield = (minYield + maxYield) / 2;
        const adjustedExp = Math.floor(CROPS[crop].exp * avgYield);
        plantedMessage += `${CROPS[crop].emoji} ${CROPS[crop].name} (Sản lượng: ${minYield} - ${maxYield}, EXP: ${adjustedExp})\n`;
    }

    plantedMessage += `\n💰 Tổng chi phí: ${totalCost.toLocaleString()} VND`;
    plantedMessage += `\n⏳ Kiểm tra thời gian thu hoạch bằng lệnh 'farm info'`;

    await saveAllData();
    api.sendMessage(plantedMessage, event.threadID);
}

// Hàm thu hoạch
async function harvestAllCrops(api, event, uid) {
    if (!plantSchema[uid]) {
        return api.sendMessage("Bạn chưa trồng cây nào cả!", event.threadID);
    }

    let harvestedCrops = [];
    let totalExp = 0;

    for (let cropName in plantSchema[uid]) {
        if (CROPS[cropName]) {
            const crop = plantSchema[uid][cropName];
            let growTime = crop.growTime;

            if (Date.now() - crop.plantedTime >= growTime) {
                if (!inventory[uid]) inventory[uid] = {};
                if (!inventory[uid][cropName]) inventory[uid][cropName] = 0;

                const [minYield, maxYield] = CROPS[cropName].yield;
                const randomYield = Math.floor(Math.random() * (maxYield - minYield + 1)) + minYield;
                inventory[uid][cropName] += randomYield;

                const expGain = CROPS[cropName].exp * randomYield;
                totalExp += expGain;

                harvestedCrops.push(`${CROPS[cropName].emoji} ${CROPS[cropName].name}: ${randomYield}`);
                delete plantSchema[uid][cropName];
            }
        }
    }

    if (harvestedCrops.length === 0) {
        return api.sendMessage("Không có cây nào sẵn sàng để thu hoạch!", event.threadID);
    }

    const levelUpMessage = updateExpAndLevel(uid, totalExp);

    let message = `
🎉 Thu hoạch thành công!
${harvestedCrops.join("\n")}

📊 EXP: ${totalExp}
    `;

    if (levelUpMessage) {
        message += `\n${levelUpMessage}`;
    }

    await saveAllData();
    api.sendMessage(message, event.threadID);
}

// Hàm cho động vật ăn
async function feedAllAnimals(api, event, uid, Currencies) {
    if (!playerData[uid]) {
        playerData[uid] = { exp: 0, level: 1 };
    }

    const now = Date.now();
    let fedAnimals = [];
    let totalExp = 0;
    let totalFeedCost = 0;

    for (let animalName in ANIMALS) {
        if (!cooldowns[uid] || !cooldowns[uid][animalName] || now - cooldowns[uid][animalName] >= ANIMALS[animalName].feedTime) {
            const feedCost = ANIMALS[animalName].feedCost;
            totalFeedCost += feedCost;

            if (!cooldowns[uid]) cooldowns[uid] = {};
            cooldowns[uid][animalName] = now;
            if (!inventory[uid]) inventory[uid] = {};

            for (let productKey in ANIMALS[animalName].products) {
                const product = ANIMALS[animalName].products[productKey];
                const [minProduct, maxProduct] = product.yield;
                const randomProduct = Math.floor(Math.random() * (maxProduct - minProduct + 1)) + minProduct;

                if (!inventory[uid][productKey]) inventory[uid][productKey] = 0;
                inventory[uid][productKey] += randomProduct;

                fedAnimals.push(`${ANIMALS[animalName].emoji} ${ANIMALS[animalName].name}: ${randomProduct} ${product.name} ${product.emoji}`);
            }

            const expGain = ANIMALS[animalName].exp;
            totalExp += expGain;
        }
    }

    if (fedAnimals.length === 0) {
        return api.sendMessage("Tất cả động vật đã được cho ăn!", event.threadID);
    }

    const userMoney = await Currencies.getData(uid);
    if (userMoney.money < totalFeedCost) {
        return api.sendMessage(`
💰 Bạn không đủ tiền để cho tất cả động vật ăn.
🪙 Chi phí: ${totalFeedCost.toLocaleString()} VND
💸 Số dư của bạn: ${userMoney.money.toLocaleString()} VND
        `, event.threadID);
    }

    await Currencies.decreaseMoney(uid, totalFeedCost);
    const levelUpMessage = updateExpAndLevel(uid, totalExp);

    let message = `
🍽️ Cho ăn thành công!
${fedAnimals.join("\n")}

💰 Tổng chi phí: ${totalFeedCost.toLocaleString()} VND
📊 EXP nhận được: ${totalExp}
    `;

    if (levelUpMessage) {
        message += `\n${levelUpMessage}`;
    }

    await saveAllData();
    api.sendMessage(message, event.threadID);
}

// Thêm log cho hàm kiểm tra và hoàn thành nấu ăn
async function checkAndFinishCooking(uid) {
    console.log(`[COOKING] Checking cooking status for user ${uid}`);
    if (!cookingActivities[uid]) return [];

    const now = Date.now();
    let finishedRecipes = [];

    for (const [recipeID, cookingInfo] of Object.entries(cookingActivities[uid])) {
        const recipe = Object.values(RECIPES).find(r => r.name.toLowerCase().replace(/\s/g, '_') === recipeID);
        if (recipe && now >= cookingInfo.finishTime) {
            console.log(`[COOKING] Recipe ${recipe.name} finished for user ${uid}`);
            if (!inventory[uid][recipeID]) inventory[uid][recipeID] = 0;
            inventory[uid][recipeID]++;
            finishedRecipes.push(recipe);
            delete cookingActivities[uid][recipeID];

            // Cộng EXP
            const expGain = recipe.exp;
            console.log(`[COOKING] User ${uid} gained ${expGain} EXP from cooking ${recipe.name}`);
            updateExpAndLevel(uid, expGain);
        } else if (recipe) {
            console.log(`[COOKING] Recipe ${recipe.name} still cooking for user ${uid}. Time left: ${formatTime(cookingInfo.finishTime - now)}`);
        }
    }

    if (finishedRecipes.length > 0) {
        await saveAllData();
        console.log(`[COOKING] Saved game data after finishing cooking for user ${uid}`);
    }

    return finishedRecipes;
}
// Hàm hiển thị thông tin trang trại
function showField(api, event, uid) {
    console.log(`[FARM] Showing farm info for user ${uid}`);
    let fieldStatus = "🏡 Trang trại của bạn:\n---------------\n";

    // Hiển thị thông tin về cây trồng
    fieldStatus += "🌱 Cây trồng:\n";
    for (let crop in plantSchema[uid]) {
        if (CROPS[crop]) {
            const plantedCrop = plantSchema[uid][crop];
            const timeLeft = plantedCrop.growTime - (Date.now() - plantedCrop.plantedTime);
            fieldStatus += `${CROPS[crop].emoji} ${CROPS[crop].name}: ${timeLeft > 0 ? formatTime(timeLeft) : "✅ Sẵn sàng thu hoạch!"}\n`;
        }
    }

    fieldStatus += "---------------\n";

    // Hiển thị thông tin về động vật
    fieldStatus += "🐾 Động vật:\n";
    for (let animal in ANIMALS) {
        const timeLeft = ANIMALS[animal].feedTime - (Date.now() - (cooldowns[uid]?.[animal] || 0));
        fieldStatus += `${ANIMALS[animal].emoji} ${ANIMALS[animal].name}: ${timeLeft > 0 ? formatTime(timeLeft) : "🍽️ Cần cho ăn!"}\n`;
    }

    fieldStatus += "---------------\n";

    // Hiển thị thông tin về các món đang nấu
    fieldStatus += "🍳 Đang nấu:\n";
    if (cookingActivities[uid] && Object.keys(cookingActivities[uid]).length > 0) {
        for (let recipeID in cookingActivities[uid]) {
            const recipe = Object.values(RECIPES).find(r => r.name.toLowerCase().replace(/\s/g, '_') === recipeID);
            if (recipe) {
                const timeLeft = cookingActivities[uid][recipeID].finishTime - Date.now();
                if (timeLeft > 0) {
                    fieldStatus += `${recipe.emoji} ${recipe.name}: ${formatTime(timeLeft)}\n`;
                } else {
                    fieldStatus += `${recipe.emoji} ${recipe.name}: ✅ Đã nấu xong!\n`;
                }
            }
        }
    } else {
        fieldStatus += "Không có món ăn nào đang được nấu.\n";
    }

    fieldStatus += "---------------\n";

    // Hiển thị thông tin về level và exp
    const level = playerData[uid]?.level || 1;
    const exp = playerData[uid]?.exp || 0;
    const nextLevelExp = (level * level * 100);
    const progressToNextLevel = Math.floor((exp / nextLevelExp) * 100);

    fieldStatus += `📊 Level: ${level}\n`;
    fieldStatus += `📈 EXP: ${exp}/${nextLevelExp} (${progressToNextLevel}%)\n`;
    api.sendMessage(fieldStatus, event.threadID);
}

// Hàm hiển thị kho đồ
async function showInventory(api, event, uid, Currencies) {
    if (!inventory[uid]) inventory[uid] = {};
    let inv = "💼 Kho của bạn:\n---------------\n";
    inv += "🌾 Nông sản:\n";
    for (let item in inventory[uid]) {
        const cropInfo = CROPS[item];
        if (cropInfo) {
            inv += `${cropInfo.emoji} ${cropInfo.name}: ${inventory[uid][item]}\n`;
        }
    }
    inv += "---------------\n";
    inv += "🥚 Sản phẩm động vật:\n";
    for (let item in inventory[uid]) {
        const animalInfo = Object.values(ANIMALS).find(animal => Object.keys(animal.products).includes(item));
        if (animalInfo) {
            const product = animalInfo.products[item];
            inv += `${product.emoji} ${product.name}: ${inventory[uid][item]}\n`;
        }
    }
    inv += "---------------\n";
    inv += "🍳 Món ăn đã nấu:\n";
    for (let item in inventory[uid]) {
        const recipeInfo = Object.values(RECIPES).find(recipe => recipe.name.toLowerCase().replace(/\s/g, '_') === item);
        if (recipeInfo) {
            inv += `${recipeInfo.emoji} ${recipeInfo.name}: ${inventory[uid][item]}\n`;
        }
    }
    const userMoney = await Currencies.getData(uid);
    inv += `\n💰 Số tiền: ${userMoney.money.toLocaleString()} VND`;
    api.sendMessage(inv, event.threadID);
}
// Hàm bán tất cả vật phẩm
async function sellAllItems(api, event, uid, Currencies) {
    if (!inventory[uid] || Object.keys(inventory[uid]).length === 0) {
        return api.sendMessage("Kho của bạn trống, không có gì để bán!", event.threadID);
    }

    let totalEarnings = 0;
    let soldItems = [];

    for (let itemKey in inventory[uid]) {
        const quantity = inventory[uid][itemKey];
        let item, price;

        if (CROPS[itemKey]) {
            item = CROPS[itemKey];
            price = item.price;
        } else if (RECIPES[itemKey]) {
            item = RECIPES[itemKey];
            price = item.price;
        } else {
            const animalProduct = Object.values(ANIMALS).find(animal => Object.keys(animal.products).includes(itemKey));
            if (animalProduct) {
                item = animalProduct.products[itemKey];
                price = item.price;
            }
        }

        if (item && price) {
            const earnings = price * quantity;
            totalEarnings += earnings;
            soldItems.push({
                name: item.name,
                emoji: item.emoji,
                quantity: quantity,
                earnings: earnings
            });
            delete inventory[uid][itemKey];
        }
    }

    if (soldItems.length === 0) {
        return api.sendMessage("Không có vật phẩm nào có thể bán!", event.threadID);
    }

    await Currencies.increaseMoney(uid, totalEarnings);
    await saveAllData();

    let message = "🎉 Đã bán tất cả vật phẩm trong kho:\n\n";
    for (let item of soldItems) {
        message += `${item.emoji} ${item.name}: ${item.quantity} cái - ${item.earnings} xu\n`;
    }
    message += `\n💰 Tổng thu: ${totalEarnings.toLocaleString()} VND`;

    const userMoney = await Currencies.getData(uid);
    message += `\n💼 Số dư mới: ${userMoney.money.toLocaleString()} VND`;

    api.sendMessage(message, event.threadID);
}

// Hàm hiển thị thông tin level
function showLevelInfo(api, event, uid) {
    if (!playerData[uid]) {
        playerData[uid] = { exp: 0, level: 1 };
    }

    const level = playerData[uid].level;
    const exp = playerData[uid].exp;
    const nextLevelExp = (level * level * 100);
    const progressToNextLevel = Math.floor((exp / nextLevelExp) * 100);

    let infoMessage = `
📊 Thông tin Level của bạn:

🏆 Level hiện tại: ${level}
📈 EXP hiện tại: ${exp}
🎯 EXP cần để lên level tiếp theo: ${nextLevelExp}
🌟 Tiến độ: ${progressToNextLevel}%

💡 Mẹo: 
- Thu hoạch cây trồng để nhận EXP. Cây trồng lâu hơn thường cho nhiều EXP hơn.
- Chăm sóc động vật thường xuyên. Động vật lớn hơn cho nhiều EXP hơn mỗi lần cho ăn.
- Nấu các món ăn phức tạp hơn để nhận nhiều EXP hơn.
- Cân nhắc giữa thời gian đầu tư và EXP nhận được để tối ưu hóa việc nâng cấp.
    `;

    api.sendMessage(infoMessage, event.threadID);
}

// Hàm cập nhật EXP và level
function updateExpAndLevel(uid, expGain) {
    if (!playerData[uid]) {
        playerData[uid] = { exp: 0, level: 1 };
    }
    const oldLevel = playerData[uid].level;
    playerData[uid].exp += expGain;
    const newLevel = calculateLevel(playerData[uid].exp);
    let levelUpMessage = "";

    if (newLevel > oldLevel) {
        playerData[uid].level = newLevel;
        levelUpMessage = `\n🎊 Chúc mừng! Bạn đã lên level ${newLevel}!`;
        return levelUpMessage;
    }
    return "";
}

// Hàm hiển thị bảng xếp hạng
async function showLeaderboard(api, event, Users) {
    const sortedPlayers = Object.entries(playerData)
        .sort(([, a], [, b]) => b.exp - a.exp)
        .slice(0, 10); // Lấy top 10

    let leaderboardMsg = "🏆 Bảng Xếp Hạng Nông Trại 🏆\n\n";

    for (let i = 0; i < sortedPlayers.length; i++) {
        const [uid, data] = sortedPlayers[i];
        const name = await Users.getNameUser(uid);
        leaderboardMsg += `${i + 1}. ${name}\n   💪 Level: ${data.level} | ✨ EXP: ${data.exp}\n`;
    }

    leaderboardMsg += "\n💡 Gõ 'farm level' để xem thông tin chi tiết của bạn!";

    api.sendMessage(leaderboardMsg, event.threadID);
}

// Hàm hiển thị menu nấu ăn


module.exports.handleReply = async function({ api, event, Users, handleReply, Currencies }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (handleReply.author != senderID) return api.sendMessage("🚫 Bạn không có quyền sử dụng lệnh này", threadID, messageID);

    try {
        switch (handleReply.type) {
            case "farmMenu":
                const farmChoice = parseInt(body);
                if (isNaN(farmChoice) || farmChoice < 1 || farmChoice > 9) {
                    return api.sendMessage("❌ Lựa chọn không hợp lệ. Vui lòng chọn số từ 1 đến 9.", threadID, messageID);
                }
                
                switch (farmChoice) {
                    case 1: // Trồng cây
                        await plantAllCrops(api, event, senderID, Currencies);
                        break;
                    case 2: // Thu hoạch
                        await harvestAllCrops(api, event, senderID);
                        break;
                    case 3: // Cho động vật ăn
                        await feedAllAnimals(api, event, senderID, Currencies);
                        break;
                    case 4: // Nấu ăn
                        console.log(`[COOKING] Showing cooking menu to user ${senderID}`);
                        const recipes = Object.values(RECIPES);
                        let menuMsg = "🍳 Menu nấu ăn:\n\n";
                        recipes.forEach((recipe, index) => {
                            menuMsg += `${index + 1}. ${recipe.emoji} ${recipe.name}\n`;
                        });
                        menuMsg += "\nReply với số tương ứng với món ăn bạn muốn nấu.";

                        return api.sendMessage(menuMsg, threadID, (error, info) => {
                            if (error) {
                                console.error('[ERROR] Error sending cooking menu:', error);
                                return;
                            }
                            console.log(`[COOKING] Cooking menu sent successfully to user ${senderID}`);
                            global.client.handleReply.push({
                                name: this.config.name,
                                messageID: info.messageID,
                                author: senderID,
                                type: "cookingMenu"
                            });
                        });
                    case 5: // Xem thông tin trang trại
                        showField(api, event, senderID);
                        break;
                    case 6: // Xem kho đồ
                        await showInventory(api, event, senderID, Currencies);
                        break;
                    case 7: // Bán vật phẩm
                        await sellAllItems(api, event, senderID, Currencies);
                        break;
                    case 8: // Xem level
                        showLevelInfo(api, event, senderID);
                        break;
                    case 9: // Xem bảng xếp hạng
                        await showLeaderboard(api, event, Users);
                        break;
                }
                break;
            case "cookingMenu":
                const recipeChoice = parseInt(body);
                const recipes = Object.values(RECIPES);
                if (isNaN(recipeChoice) || recipeChoice < 1 || recipeChoice > recipes.length) {
                    api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                    return api.sendMessage(`❌ Lựa chọn không hợp lệ. Vui lòng chọn số từ 1 đến ${recipes.length}.`, threadID, messageID);
                }
                const selectedRecipe = recipes[recipeChoice - 1];
                if (!selectedRecipe) {
                    api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                    return api.sendMessage("❌ Không tìm thấy công thức nấu ăn được chọn.", threadID, messageID);
                }
                
                api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                
                return api.sendMessage(
                    `Bạn đã chọn nấu món ${selectedRecipe.emoji} ${selectedRecipe.name}.\nNguyên liệu cần có:\n${Object.entries(selectedRecipe.ingredients).map(([ing, amount]) => `- ${CROPS[ing]?.name || ing}: ${amount}`).join('\n')}\n\nReply "ok" để xác nhận nấu.`,
                    threadID,
                    (error, info) => {
                        global.client.handleReply.push({
                            name: this.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "confirmCooking",
                            recipe: selectedRecipe
                        });
                    }
                );

            case "confirmCooking":
                if (body.toLowerCase() !== "ok") {
                    api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                    return api.sendMessage("❌ Đã hủy nấu ăn.", threadID, messageID);
                }
                
                const recipe = handleReply.recipe;
                // Kiểm tra nguyên liệu
                for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
                    if (!inventory[senderID][ingredient] || inventory[senderID][ingredient] < amount) {
                        api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                        return api.sendMessage(`❌ Bạn không đủ ${CROPS[ingredient]?.name || ingredient} để nấu ${recipe.name}!`, threadID, messageID);
                    }
                }

                // Trừ nguyên liệu
                for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
                    inventory[senderID][ingredient] -= amount;
                }

                // Bắt đầu nấu
                if (!cookingActivities[senderID]) cookingActivities[senderID] = {};
                const recipeID = recipe.name.toLowerCase().replace(/\s/g, '_');
                cookingActivities[senderID][recipeID] = {
                    startTime: Date.now(),
                    finishTime: Date.now() + recipe.cookTime
                };

                try {
                    await saveAllData();
                } catch (error) {
              console.log('Lỗi nấu ăn');
                }

                api.unsendMessage(handleReply.messageID); // Thu hồi tin nhắn trước đó
                return api.sendMessage(`🍳 Bắt đầu nấu ${recipe.emoji} ${recipe.name}. Sẽ hoàn thành sau ${formatTime(recipe.cookTime)}.`, threadID, messageID);

                                    
            default:
                console.log(`[ERROR] Unknown reply type: ${handleReply.type}`);
                api.sendMessage("❌ Đã xảy ra lỗi trong quá trình xử lý.", threadID, messageID);
        }
    } catch (error) {
        console.error('[ERROR] Error in handleReply:', error);
        api.sendMessage(`❌ Đã xảy ra lỗi: ${error.message}`, threadID, messageID);
    }
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID, senderID, messageID } = event;
    const command = args[0];
    const uid = senderID;

    try {
        await loadAllData();

        // Reset số lần giúp đỡ mỗi ngày
        const currentDate = new Date().toDateString();
        if (global.farmData.lastResetDate !== currentDate) {
            for (let uid in playerData) {
                playerData[uid].helpCount = {};
            }
            global.farmData.lastResetDate = currentDate;
            await saveAllData();
        }

        // Kiểm tra và hoàn thành các món ăn đang nấu
        const finishedRecipes = await checkAndFinishCooking(uid);
        if (finishedRecipes.length > 0) {
            let finishMessage = "🍽️ Các món ăn đã hoàn thành:\n";
            for (const recipe of finishedRecipes) {
                finishMessage += `${recipe.emoji} ${recipe.name}\n`;
            }
            api.sendMessage(finishMessage, threadID);
        }

        if (!command) {
            // Hiển thị menu chính
            const menu = `🌾 Chào mừng đến với Farm! Bạn muốn làm gì?
1.🌱 Trồng cây
2. 🌾 Thu hoạch
3. ⚒️ Cho động vật ăn
4. 🧑‍🍳 Nấu ăn
5. 🧾 Xem thông tin trang trại
6. 🎒 Xem kho đồ
7. 💸 Bán vật phẩm
8. ✅ Xem level
9. 🔝 Xem bảng xếp hạng

📌 Reply số tương ứng với lựa chọn của bạn.`;

            return api.sendMessage(menu, threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    type: "farmMenu"
                });
            });
        }

        switch(command.toLowerCase()) {
            case "trồng":
                await plantAllCrops(api, event, uid, Currencies);
                break;
            case "thu hoạch":
            case "thuhoach":
                await harvestAllCrops(api, event, uid);
                break;
            case "cho ăn":
            case "choan":
                await feedAllAnimals(api, event, uid, Currencies);
                break;
            case "nấu ăn":
            case "nauan":
                showCookingMenu(api, event, uid);
                break;
            case "info":
                showField(api, event, uid);
                break;
            case "kho":
                await showInventory(api, event, uid, Currencies);
                break;
            case "bán":
                await sellAllItems(api, event, uid, Currencies);
                break;
            case "level":
                showLevelInfo(api, event, uid);
                break;
            case "bxh":
                await showLeaderboard(api, event, Users);
                break;
            default:
                api.sendMessage("❌ Lệnh không hợp lệ. Vui lòng sử dụng 'farm' để xem danh sách các lệnh.", threadID, messageID);
        }

        await saveAllData();

    } catch (error) {
        console.error('Lỗi trong quá trình xử lý lệnh:', error);
        api.sendMessage(`❌ Đã xảy ra lỗi: ${error.message}`, threadID);
    }
};