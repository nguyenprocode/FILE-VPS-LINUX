module.exports.config = {
  name: "bank",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Judas - Satoru",
  description: "Hệ thống ngân hàng",
  commandCategory: "Money", 
  usages: "",
  cooldowns: 3
};

const laisuat = 0.005;
const timeIM = 3600;

function replace(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function generateSTK() {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

module.exports.onLoad = function({ }) {
  const { existsSync, writeFileSync } = require('fs-extra');
  const { join } = require('path');
  const pathData = join(__dirname, "data", "bank.json");
  if (!existsSync(pathData)) return writeFileSync(pathData, "[]", "utf-8");
}

module.exports.run = async ({ event, api, args, Currencies, Users }) => {
  const { threadID, messageID, senderID } = event;
  const { readFileSync, writeFileSync } = require("fs-extra");
  const { join } = require("path");
  const pathData = join(__dirname, "data", "bank.json");
  const moment = require("moment-timezone");
  var timeNow = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

  var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
  var userData = dataJson.find(item => item.senderID == senderID);
  const moneyUser = (await Currencies.getData(senderID)).money;

  switch (args[0]) {
    case "register":
    case "-r": {
      if (userData) 
        return api.sendMessage(`⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn đã có tài khoản trên hệ thống MB Bank`, threadID, messageID);
      
      const stk = generateSTK();
      
      userData = {
        senderID: senderID,
        name: (await Users.getData(senderID)).name,
        money: 500000,
        stk: stk,
        time: timeNow,
        status: true,
        vay: {
          solan: 0,
          davay: false,
          sotien: 0,
          noxau: false,
          time: ""
        }
      };
      
      dataJson.push(userData);
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Đăng ký thành công\n👤 Chủ tài khoản: ${userData.name}\n💳 STK: ${stk}\n💰 Được tặng: 500.000 VND\n⏰ Thời gian: ${timeNow}`, threadID, messageID);
    }

    case "gửi":
    case "send": {
      if (!userData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng ký ngân hàng', threadID, messageID);
      
      var money = args[1];
      if (!money || money < 50 || isNaN(money)) 
        return api.sendMessage("⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Vui lòng nhập đúng số tiền", threadID, messageID);
      
      if (moneyUser < money) 
        return api.sendMessage(`⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Số dư không đủ để giao dịch`, threadID, messageID);

      await Currencies.decreaseMoney(senderID, parseInt(money));
      let message = "";
      if (userData.vay.davay && userData.vay.sotien > 0) {
        const autoRepayAmount = Math.floor(parseInt(money) * 0.5); // 50% số tiền gửi vào để trả nợ
        const actualRepay = Math.min(autoRepayAmount, userData.vay.sotien);
        
        userData.vay.sotien -= actualRepay;
        if (userData.vay.sotien === 0) {
          userData.vay.davay = false;
          userData.vay.time = "";
        }
        
        const remainingDeposit = parseInt(money) - actualRepay;
        userData.money = parseInt(userData.money) + remainingDeposit;
        
        message = `✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Giao dịch thành công\n💰 Số tiền gửi: ${replace(money)} VND\n💸 Số tiền trả nợ tự động: ${replace(actualRepay)} VND\n💳 Số nợ còn lại: ${replace(userData.vay.sotien)} VND\n💵 Số tiền vào tài khoản: ${replace(remainingDeposit)} VND\n⏰ Thời gian: ${timeNow}`;
      } else {
        userData.money = parseInt(userData.money) + parseInt(money);
        message = `✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Giao dịch thành công\n💰 Số tiền: ${replace(money)} VND\n💳 STK: ${userData.stk}\n⏰ Thời gian: ${timeNow}`;
      }
      
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(message, threadID, messageID);
    }

    case "rút": {
      if (!userData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng ký ngân hàng', threadID, messageID);
      
      var money = args[1];
      if (!money || money < 50 || isNaN(money)) 
        return api.sendMessage("⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Vui lòng nhập đúng số tiền", threadID, messageID);
      
      if (userData.money < money) 
        return api.sendMessage(`⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Số dư không đủ để giao dịch`, threadID, messageID);

      await Currencies.increaseMoney(senderID, parseInt(money));
      userData.money = parseInt(userData.money) - parseInt(money);
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Rút tiền thành công\n💰 Số tiền: ${replace(money)} VND\n💳 STK: ${userData.stk}\n⏰ Thời gian: ${timeNow}`, threadID, messageID);
    }

    case "pay":
    case "-p": {
      if (!userData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng ký ngân hàng', threadID, messageID);
      
      var receiverSTK = args[1];
      var money = args[2];
      
      if (!receiverSTK || !money || isNaN(money) || money <= 0) 
        return api.sendMessage("⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Vui lòng nhập đúng STK người nhận và số tiền", threadID, messageID);
      
      var receiverData = dataJson.find(item => item.stk == receiverSTK);
      if (!receiverData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Không tìm thấy người nhận', threadID, messageID);
      
      if (userData.money < money) 
        return api.sendMessage(`⚠️ 【 𝐌𝐁 𝐁𝐚𝐧𝐤 】 → Số dư không đủ để giao dịch`, threadID, messageID);

      userData.money = parseInt(userData.money) - parseInt(money);
      receiverData.money = parseInt(receiverData.money) + parseInt(money);
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Chuyển tiền thành công\n💰 Số tiền: ${replace(money)} VND\n👤 Người nhận: ${receiverData.name}\n💳 STK: ${receiverSTK}\n⏰ Thời gian: ${timeNow}`, threadID, messageID);
    }

    case "check":
    case "coins": {
      if (Object.keys(event.mentions).length == 1) {
        var mention = (Object.keys(event.mentions))[0];
        var users = dataJson.find(item => item.senderID == mention);
        if (!users) 
          return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Người dùng chưa đăng kí sử dụng MB bank', threadID, messageID);
        return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Thông tin tài khoản:\n👤 Chủ tài khoản: ${users.name}\n💰 Số dư: ${replace(users.money)} VND\n📆 Ngày tham gia: ${users.time}\n✅ Trạng thái: ${users.status ? "Actived" : "Banned"}\n💳 STK: ${users.stk}\n💸 Nợ: ${users.vay.davay ? replace(users.vay.sotien) : "0"} VND\n💷 Lãi suất: ${laisuat * 100}% trong ${timeIM / 60} phút`, threadID, messageID);
      } else {
        if (!userData) 
          return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng kí sử dụng MB bank', threadID, messageID);
        return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Thông tin tài khoản:\n👤 Chủ tài khoản: ${userData.name}\n💰 Số dư: ${replace(userData.money)} VND\n📆 Ngày tham gia: ${userData.time}\n✅ Trạng thái: ${userData.status ? "Actived" : "Banned"}\n💳 STK: ${userData.stk}\n💸 Nợ: ${userData.vay.davay ? replace(userData.vay.sotien) : "0"} VND\n💷 Lãi suất: ${laisuat * 100}% trong ${timeIM / 60} phút`, threadID, messageID);
      }
    }

    case "vay": {
      if (!userData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng ký ngân hàng', threadID, messageID);
      
      var money = args[1];
      if (userData.vay.solan == 5 || userData.status == false) 
        return api.sendMessage(`⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn đã ${userData.vay.solan == 5 ? "đạt số lần vay là 5" : "dính nợ xấu"} nên không thể tiếp tục vay`, threadID, messageID);
      
      if (!money || money < 5000 || money > 5000000 || isNaN(money)) 
        return api.sendMessage("⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Số tiền bạn nhập không hợp lệ (5.000 - 5.000.000 VND)", threadID, messageID);

      userData.vay.sotien = parseInt(userData.vay.sotien) + parseInt(money);
      userData.vay.solan += 1;
      userData.vay.time = timeNow;
      userData.vay.davay = true;
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      await Currencies.increaseMoney(senderID, parseInt(money));
      return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Vay tiền thành công\n💰 Số tiền: ${replace(money)} VND\n📝 Số lần đã vay: ${userData.vay.solan}/5\n⏰ Thời gian: ${timeNow}`, threadID, messageID);
    }

    case "trả": {
      if (!userData) 
        return api.sendMessage('⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa đăng ký ngân hàng', threadID, messageID);
      
      var money = args[1];
      if (!userData.vay.davay) 
        return api.sendMessage("⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn chưa vay tiền", threadID, messageID);
      
      if (!money || isNaN(money)) 
        return api.sendMessage("⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Vui lòng nhập số tiền cần trả", threadID, messageID);
      
      if (userData.vay.sotien < money) 
        return api.sendMessage(`⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Số tiền bạn trả lớn hơn số tiền bạn vay\n💰 Số tiền vay: ${replace(userData.vay.sotien)} VND`, threadID, messageID);
      
      if (moneyUser < money) 
        return api.sendMessage(`⚠️ 【 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 】 → Bạn không đủ tiền để trả nợ`, threadID, messageID);

      userData.vay.sotien = parseInt(userData.vay.sotien) - parseInt(money);
      if (userData.vay.sotien === 0) {
        userData.vay.davay = false;
        userData.vay.time = "";
      }
      writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      await Currencies.decreaseMoney(senderID, parseInt(money));
      return api.sendMessage(`✅ 【 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 】 → Trả nợ thành công\n💰 Số tiền: ${replace(money)} VND\n💳 Số tiền còn nợ: ${replace(userData.vay.sotien)} VND\n⏰ Thời gian: ${timeNow}`, threadID, messageID);
    }

    case "top": {
      var topUsers = dataJson.sort((a, b) => b.money - a.money).slice(0, 10);
      var msg = "👑 ── 𝐓𝐎𝐏 𝟏𝟎 𝐁𝐀𝐍𝐊 ── 👑\n\n";
      for (let i = 0; i < topUsers.length; i++) {
        msg += `${i + 1}. ${topUsers[i].name}\n💰 Số dư: ${replace(topUsers[i].money)} VND\n\n`;
      }
      return api.sendMessage(msg, threadID, messageID);
    }

    case "all": {
      var allUsers = dataJson.map(user => `👤 Chủ tài khoản: ${user.name}\n💳 STK: ${user.stk}\n💰 Số dư: ${replace(user.money)} VND\n===================\n`);
      var msg = "🏦 ── 𝐓𝐀̀𝐈 𝐊𝐇𝐎𝐀̉𝐍 𝐌𝐁 𝐁𝐀𝐍𝐊 ── 🏦\n\n" + allUsers.join("\n");
      return api.sendMessage(msg, threadID, messageID);
    }

    default: {
      return api.sendMessage("🏦 ── [ 𝐌𝐁 𝐁𝐀𝐍𝐊 ] ── 🏦\n\n➣ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭:\n🔰 /bank register - Đăng ký MB bank\n💰 /bank send [số tiền] - Gửi tiền vào MB bank\n💸 /bank rút [số tiền] - Rút tiền từ MB bank\n🔍 /bank check - Xem thông tin banking\n💳 /bank pay [stk] [số tiền] - Chuyển tiền cho người khác\n💴 /bank vay [số tiền] - Vay tiền từ MB Bank\n💵 /bank trả [số tiền] - Trả nợ cho MB Bank\n👑 /bank top - Xem top người dùng MB bank\n📜 /bank all - Xem toàn bộ tài khoản MB Bank", threadID, messageID);
    }
  }
}
setInterval(async () => {
  const { readFileSync, writeFileSync } = require("fs-extra");
  const { join } = require("path");
  const pathData = join(__dirname, "data", "bank.json");
  var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
  
  for (let user of dataJson) {
    user.money += Math.floor(user.money * laisuat);
  }
  
  writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
}, timeIM * 1000);

setInterval(async () => {
  const { readFileSync, writeFileSync } = require("fs-extra");
  const { join } = require("path");
  const pathData = join(__dirname, "data", "bank.json");
  var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
  const moment = require("moment-timezone");
  
  for (let user of dataJson) {
    if (user.vay.davay) {
      const now = moment();
      const vayTime = moment(user.vay.time, "DD/MM/YYYY");
      const daysPassed = now.diff(vayTime, 'days');
      
      if (daysPassed >= 7) {
        user.vay.sotien = Math.floor(user.vay.sotien * 1.05); 
        user.vay.time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
        
        if (daysPassed >= 30) {
          user.status = false;
          user.vay.noxau = true;
        }
      }
    }
  }
  
  writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
}, 24 * 60 * 60 * 1000); 