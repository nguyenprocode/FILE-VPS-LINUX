const fs = require("fs");

module.exports.config = {
  name: "hunt",
  version: "2.4.0",
  hasPermssion: 0,
  credits: "Gojo Satoru",
  description: "Săn thú và quản lý kho đồ",
  commandCategory: "Game",
  usages: "[shop/use/sell/kho]",
  cooldowns: 5,
};

// Giả lập database
let userInventories = {};

// Hàm lưu dữ liệu
function saveData() {
  fs.writeFileSync('./modules/commands/game/userInventories.json', JSON.stringify(userInventories));
}

// Hàm đọc dữ liệu
function loadData() {
  if (fs.existsSync('./modules/commands/game/userInventories.json')) {
    userInventories = JSON.parse(fs.readFileSync('./modules/commands/game/userInventories.json'));
  }
}

// Load data khi khởi động bot
loadData();

// Định nghĩa các loại thú (đã cập nhật)
const animals = {
  a: ["🐁", "🐇", "🐈", "🐕", "🦊", "🐟", "🦐", "🪱", "🐝", "🐜", "🦎"],
  s: ["🐓", "🐖", "🐑", "🐄", "🐃", "🦇", "🦉", "🐢", "🐍", "🦩", "🦨", "🦑"],
  "s+": ["🦌", "🐒", "🦛", "🐆", "🐅", "🐊", "🐬", "🪼", "🦬", "🦃", "🦓"],
  ss: ["🦁", "🐯", "🐻", "🐼", "🐨", "🦭", "🦒", "🦙", "🦝", "🦥", "🦏"],
  sss: ["🐉", "🦄", "🦅", "🦍", "🦈", "🐋", "🐦‍🔥", "🦚", "🦣", "🦖"]
};


// Định nghĩa các loại dụng cụ săn bắn (đã thêm cooldown)
const tools = {
  "bẫy": { icon: "🕸️", price: 100, quantity: 2, chance: 0.1, cooldown: 10 * 60 * 1000 }, // 10 phút
  "giáo": { icon: "🗡️", price: 500, quantity: 4, chance: 0.2, cooldown: 15 * 60 * 1000 }, // 15 phút
  "nỏ": { icon: "🏹", price: 1000, quantity: 7, chance: 0.3, cooldown: 20 * 60 * 1000 }, // 20 phút
  "súng": { icon: "🔫", price: 2000, quantity: 10, chance: 0.4, cooldown: 30 * 60 * 1000 } // 30 phút
};

function getRandomAnimal(toolChance, toolQuantity) {
  const rarities = ["a", "s", "s+", "ss", "sss"];
  const chances = [1, 0.8, 0.6, 0.3, 0.1];
  
  let caughtAnimals = [];
  
  for (let i = 0; i < toolQuantity; i++) {
    let animalCaught = false;
    for (let j = 0; j < rarities.length; j++) {
      if (Math.random() < chances[j] * toolChance) {
        const animalList = animals[rarities[j]];
        caughtAnimals.push({
          name: animalList[Math.floor(Math.random() * animalList.length)],
          type: rarities[j]
        });
        animalCaught = true;
        break;
      }
    }
    if (!animalCaught) {
      const animalList = animals["a"];
      caughtAnimals.push({
        name: animalList[Math.floor(Math.random() * animalList.length)],
        type: "a"
      });
    }
  }
  
  return caughtAnimals;
}

function getAnimalValue(type) {
  const values = {
    "a": 100,
    "s": 500,
    "s+": 1000,
    "ss": 5000,
    "sss": 10000
  };
  return values[type];
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes} phút ${(seconds < 10 ? '0' : '')}${seconds} giây`;
}

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  
  if (!userInventories[senderID]) {
    userInventories[senderID] = { animals: {}, toolUsage: {} };
  }

  const userInventory = userInventories[senderID];

  const command = args[0] ? args[0].toLowerCase() : "";

  switch(command) {
    case "shop":
      let shopMessage = "🛒 Cửa hàng dụng cụ săn bắn:\n\n";
      for (const [toolName, toolInfo] of Object.entries(tools)) {
        shopMessage += `${toolInfo.icon} ${toolName}: ${toolInfo.price} xu (${toolInfo.quantity} thú, ${toolInfo.chance * 100}% cơ hội thú hiếm, Thời gian chờ: ${formatTime(toolInfo.cooldown)})\n`;
      }
      api.sendMessage(shopMessage, threadID, messageID);
      break;

    case "use":
      if (args.length < 2) {
        return api.sendMessage("Vui lòng chọn dụng cụ để sử dụng. Ví dụ: /hunt use bẫy", threadID, messageID);
      }
      const toolName = args[1].toLowerCase();
      if (!tools[toolName]) {
        return api.sendMessage("Dụng cụ không hợp lệ. Vui lòng kiểm tra lại shop.", threadID, messageID);
      }
      const tool = tools[toolName];
      
      // Kiểm tra thời gian chờ
      const lastUsage = userInventory.toolUsage[toolName] || 0;
      const currentTime = Date.now();
      if (currentTime - lastUsage < tool.cooldown) {
        const remainingTime = formatTime(tool.cooldown - (currentTime - lastUsage));
        return api.sendMessage(`Bạn cần đợi ${remainingTime} nữa mới có thể sử dụng ${toolName} lần nữa.`, threadID, messageID);
      }
      
      const userMoney = await Currencies.getData(senderID);
      if (userMoney.money < tool.price) {
        return api.sendMessage(`Bạn không đủ tiền để mua ${toolName}. Cần ${tool.price} xu.`, threadID, messageID);
      }
      await Currencies.decreaseMoney(senderID, tool.price);
      
      // Cập nhật thời gian sử dụng
      userInventory.toolUsage[toolName] = currentTime;
      
      const caughtAnimals = getRandomAnimal(tool.chance, tool.quantity);
      let huntMessage = `${tool.icon} Bạn đã sử dụng ${toolName} và bắt được ${caughtAnimals.length} thú:\n\n`;
      let totalValue = 0;
      
      for (const animal of caughtAnimals) {
        if (!userInventory.animals[animal.name]) {
          userInventory.animals[animal.name] = 0;
        }
        userInventory.animals[animal.name]++;
        const value = getAnimalValue(animal.type);
        totalValue += value;
        huntMessage += `${animal.name} (${animal.type.toUpperCase()}) - ${value} xu\n`;
      }
      
      huntMessage += `\nTổng giá trị: ${totalValue} xu`;
      api.sendMessage(huntMessage, threadID, messageID);
      break;

    case "sell":
      let sellValue = 0;
      for (const [animalName, animalCount] of Object.entries(userInventory.animals)) {
        const animalType = Object.keys(animals).find(key => animals[key].includes(animalName));
        const animalValue = getAnimalValue(animalType);
        sellValue += animalValue * animalCount;
        userInventory.animals[animalName] = 0;
      }
      await Currencies.increaseMoney(senderID, sellValue);
      api.sendMessage(`Bạn đã bán tất cả thú và nhận được ${sellValue} xu!`, threadID, messageID);
      break;

    case "kho":
      let inventoryMessage = "🎒 Kho thú của bạn:\n\n";
      let totalAnimals = 0;
      let estimatedValue = 0;
      for (const [animalName, animalCount] of Object.entries(userInventory.animals)) {
        if (animalCount > 0) {
          const animalType = Object.keys(animals).find(key => animals[key].includes(animalName));
          const animalValue = getAnimalValue(animalType);
          inventoryMessage += `${animalName} (${animalType.toUpperCase()}): ${animalCount} con - ${animalValue * animalCount} xu\n`;
          totalAnimals += animalCount;
          estimatedValue += animalValue * animalCount;
        }
      }
      inventoryMessage += `\nTổng số thú: ${totalAnimals} con`;
      inventoryMessage += `\nƯớc tính tổng giá trị: ${estimatedValue} xu`;
      api.sendMessage(inventoryMessage, threadID, messageID);
      break;

    default:
      api.sendMessage("Lệnh không hợp lệ. Sử dụng: /hunt [shop/use/sell/kho]", threadID, messageID);
  }

  // Lưu dữ liệu sau mỗi lần thực hiện lệnh
  saveData();
};