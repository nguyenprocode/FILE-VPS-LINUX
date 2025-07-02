this.config = {
  name: "check",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "DungUwU && Nghĩa",
  description: "Check tương tác ngày/tuần/toàn bộ",
  commandCategory: "Box",
  usages: "[all/week/day]",
  cooldowns: 5,
  images: [],
  dependencies: {
    "fs": " ",
    "moment-timezone": " "
  }
};
const path = __dirname + '/_checktt/';
const moment = require('moment-timezone');

this.onLoad = () => {
  const fs = require('fs');
  if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
    fs.mkdirSync(path, { recursive: true });
  }
  setInterval(() => {
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const checkttData = fs.readdirSync(path);
    checkttData.forEach(file => {
      try { var fileData = JSON.parse(fs.readFileSync(path + file)) } catch { return fs.unlinkSync(path+file) };
      if (fileData.time != today) {
        setTimeout(() => {
          fileData = JSON.parse(fs.readFileSync(path + file));
          if (fileData.time != today) {
            fileData.time = today;
            fs.writeFileSync(path + file, JSON.stringify(fileData, null, 4));
          }
        }, 60 * 1000);
      }
    })
  }, 60 * 1000);
}
this.handleEvent = async function({ api, event, Threads }) {
  try {
    if (!event.isGroup) return;
    if (global.client.sending_top == true) return;
    const fs = global.nodemodule['fs'];
    const { threadID, senderID } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    if (!fs.existsSync(path + threadID + '.json')) {
      var newObj = {
        total: [],
        week: [],
        day: [],
        time: today,
        last: {
          time: today,
          day: [],
          week: [],
        },
        lastInteraction: {}
      };
      fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
    } else {
      var newObj = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    }
    if (true) {
      const UserIDs = event.participantIDs || [];
      if (UserIDs.length != 0) for (let user of UserIDs) {
        if (!newObj.last) newObj.last = {
          time: today,
          day: [],
          week: [],
        };
        if (!newObj.last.week.find(item => item.id == user)) {
          newObj.last.week.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.last.day.find(item => item.id == user)) {
          newObj.last.day.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.total.find(item => item.id == user)) {
          newObj.total.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.week.find(item => item.id == user)) {
          newObj.week.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.day.find(item => item.id == user)) {
          newObj.day.push({
            id: user,
            count: 0
          });
        }
      }
    };
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));  
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    if (threadData.time != today) {
      global.client.sending_top = true;
      setTimeout(() => global.client.sending_top = false, 5 * 60 * 1000);
    }
    const userData_week_index = threadData.week.findIndex(e => e.id == senderID);
    const userData_day_index = threadData.day.findIndex(e => e.id == senderID);
    const userData_total_index = threadData.total.findIndex(e => e.id == senderID);
    if (userData_total_index == -1) {
      threadData.total.push({
        id: senderID,
        count: 1,
      });
    } else threadData.total[userData_total_index].count++;
    if (userData_week_index == -1) {
      threadData.week.push({
        id: senderID,
        count: 1
      });
    } else threadData.week[userData_week_index].count++;
    if (userData_day_index == -1) {
      threadData.day.push({
        id: senderID,
        count: 1
      });
    } else threadData.day[userData_day_index].count++;
    let p = event.participantIDs;
    if (!!p && p.length > 0) {
      p = p.map($=>$+'');
      ['day','week','total'].forEach(t=>threadData[t] = threadData[t].filter($=>p.includes($.id+'')));
    };
  
    // Thêm tương tác gần đây
    const lastInteraction = {
      id: senderID,
      time: Date.now()
    };
    threadData.lastInteraction = threadData.lastInteraction || {};
threadData.lastInteraction[senderID] = Date.now();
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(threadData, null, 4));
  } catch(e) {};
}
this.run = async function({ api, event, args, Users, Threads, Currencies }) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const fs = global.nodemodule['fs'];
  const { threadID, messageID, senderID, mentions } = event;
  let path_data = path + threadID + '.json';
  if (!fs.existsSync(path_data)) {
    return api.sendMessage("⚠️ Chưa có dữ liệu", threadID);
  }
  const threadData = JSON.parse(fs.readFileSync(path_data));
  const query = args[0] ? args[0].toLowerCase() : '';

  if (query == 'box') {
    let body_ = event.args[0].replace(exports.config.name, '')+'box info';
    let args_ = body_.split(' ');
    
    arguments[0].args = args_.slice(1);
    arguments[0].event.args = args_;
    arguments[0].event.body = body_;
    
    return require('./box.js').run(...Object.values(arguments));
  } else if (query == 'loc') {
    if (!global.config.NDH.includes(senderID)) {
        return api.sendMessage("⚠️ Bạn không đủ quyền hạn để sử dụng lệnh này", threadID, messageID);
    }

    let count = 0;
    let removedCount = 0;
    const allThreads = await api.getThreadList(100, null, ['INBOX']);
    const allThreadIDs = new Set(allThreads.map(t => t.threadID));
    
    try {
        // Đọc tất cả files trong thư mục
        const dataPath = __dirname + '/_checktt/';
        const files = fs.readdirSync(dataPath);
        
        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            count++;
            
            const threadID = file.replace('.json', '');
            const filePath = dataPath + file;
            
            // Kiểm tra xem bot còn trong nhóm không
            if (!allThreadIDs.has(threadID)) {
                try {
                    fs.unlinkSync(filePath);
                    removedCount++;
                    console.log(`[CHECK] Đã xóa file của nhóm: ${threadID}`);
                } catch (err) {
                    console.error(`[CHECK] Lỗi khi xóa file ${file}:`, err);
                }
            }
        }

        // Tạo thông báo chi tiết
        let message = '✅ Đã lọc xong dữ liệu nhóm!\n\n';
        message += '📊 Thống kê:\n';
        message += `➣ Tổng số nhóm: ${count}\n`;
        message += `➣ Số nhóm đã xóa: ${removedCount}\n`;
        message += `➣ Số nhóm còn lại: ${count - removedCount}\n\n`;
        message += `💡 Đã xóa ${removedCount} nhóm không tồn tại khỏi dữ liệu`;

        return api.sendMessage(message, threadID);

    } catch (error) {
        console.error('[CHECK] Lỗi:', error);
        return api.sendMessage('❎ Đã xảy ra lỗi trong quá trình lọc dữ liệu', threadID);
    }
  } else if (query === 'ndfb') {
let body_ = event.args[0].replace(exports.config.name, '')+'kickdnfb';
    let args_ = body_.split(' ');
    
    arguments[0].args = args_.slice(1);
    arguments[0].event.args = args_;
    arguments[0].event.body = body_;
    
    return require('./kickndfb.js').run(...Object.values(arguments));
   } else if(query == 'locmem') {
        let threadInfo = await api.getThreadInfo(threadID);
        if(!threadInfo.adminIDs.some(e => e.id == senderID)) return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
        if(!threadInfo.isGroup) return api.sendMessage("❎ Chỉ có thể sử dụng trong nhóm", threadID);
        if(!threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID())) return api.sendMessage("⚠️ Bot Cần Quyền Quản Trị Viên", threadID);
        if(!args[1] || isNaN(args[1])) return api.sendMessage("Error", threadID);
        let minCount = +args[1],
            allUser = event.participantIDs;let id_rm = [];
        for(let user of allUser) {
            if(user == api.getCurrentUserID()) continue;
            if(!threadData.total.some(e => e.id == user) || threadData.total.find(e => e.id == user).count <= minCount) {
                await new Promise(resolve=>setTimeout(async () => {
                    await api.removeUserFromGroup(user, threadID);
                    id_rm.push(user);
                    resolve(true);
                }, 1000));
            }
        }
    return api.sendMessage(`☑️ Đã xóa ${id_rm.length} thành viên ${minCount} tin nhắn\n\n${id_rm.map(($,i)=>`${i+1}. ${global.data.userName.get($)}`)}`, threadID);
  } else if (query == 'call') {
    let threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(e => e.id == senderID)) return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
    if (!threadInfo.isGroup) return api.sendMessage("❎ Chỉ có thể sử dụng trong nhóm", threadID);
    
    let inactiveUsers = threadData.total.filter(user => user.count < 5);
    if (inactiveUsers.length === 0) return api.sendMessage("Không có thành viên nào dưới 5 tin nhắn.", threadID);
    
    let mentionBody = "";
    let mentionIds = [];
    for (let user of inactiveUsers) {
      let name = await Users.getNameUser(user.id);
      mentionBody += `${name}\n`;
      mentionIds.push({ id: user.id, tag: `${name}` });
    }
    
    let message = `${mentionBody}\n Dậy tương tác đi, cá cảnh hơi lâu rồi đó 🙂!`;
    return api.sendMessage({ body: message, mentions: mentionIds }, threadID);
  }

  ////////small code///////////////////////
  var x = threadData.total.sort((a, b) => b.count - a.count);
  var o = [];
  for (i = 0; i < x.length; i++) {
    o.push({
      rank: i + 1,
      id: x[i].id,
      count: x[i].count
    })
  }
  /////////////////////////////////////////////////////////////
  var header = '',
      body = '',
      footer = '',
      msg = '',
      count = 1,
      storage = [],
      data = 0;
  if (query == 'all' || query == '-a') {
    header = '[ Kiểm Tra Tin nhắn Tổng ]\n────────────';
    data = threadData.total;
  } else if (query == 'week' || query == '-w') {
    header = '[ Kiểm Tra Tin nhắn Tuần ]\n────────────────';
    data = threadData.week;
  } else if (query == 'day' || query == '-d') {
    header = '[ Kiểm Tra Tin nhắn Ngày ]\n────────────────';
    data = threadData.day;
  } else {
    data = threadData.total;
  }
  for (const item of data) {
    const userName = await Users.getNameUser(item.id) || 'Facebook User';
    const itemToPush = item;
    itemToPush.name = userName;
    storage.push(itemToPush);
  };
  let check = ['all', '-a', 'week', '-w', 'day', '-d'].some(e => e == query);
  storage.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    else if (a.count < b.count) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  if ((!check && Object.keys(mentions).length == 0) || (!check && Object.keys(mentions).length == 1) || (!check && event.type == 'message_reply')) {
    const UID = event.messageReply ? event.messageReply.senderID : Object.keys(mentions)[0] ? Object.keys(mentions)[0] : senderID;
    const userRank = storage.findIndex(e => e.id == UID);
    const userTotal = threadData.total.find(e => e.id == UID) ? threadData.total.find(e => e.id == UID).count : 0;
    const userTotalWeek = threadData.week.find(e => e.id == UID) ? threadData.week.find(e => e.id == UID).count : 0;
    const userRankWeek = threadData.week.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
    const userTotalDay = threadData.day.find(e => e.id == UID) ? threadData.day.find(e => e.id == UID).count : 0;
    const userRankDay = threadData.week.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
    const nameUID = storage[userRank].name || 'Facebook User';
    let threadInfo = await api.getThreadInfo(event.threadID);
    nameThread = threadInfo.threadName;
    var permission;
    if (global.config.ADMINBOT.includes(UID)) permission = `Admin Bot`;
    else if (global.config.NDH.includes(UID)) permission = `Người Hỗ Trợ`; 
    else if (threadInfo.adminIDs.some(i => i.id == UID)) permission = `Quản Trị Viên`; 
    else permission = `Thành Viên`;
    const target = UID == senderID ? 'Bạn' : nameUID;
    let lastInteraction = threadData.lastInteraction && threadData.lastInteraction[UID] 
      ? moment(threadData.lastInteraction[UID]).format('HH:mm:ss DD/MM/YYYY')
      : 'Chưa có';
    // Lấy exp từ hệ thống rankup
    let exp = 0;
try {
  const userData = await Currencies.getData(UID);
  exp = userData.exp;
} catch (error) {
  console.error("Error getting user data:", error);
  exp = 0; // Sử dụng giá trị mặc định nếu không lấy được dữ liệu
}
    const level = LV(exp);
    const realm = getCultivationRealm(level);

    body += `[ ${nameThread} ]\n👤Tên: ${nameUID}\n🔐Chức Vụ: ${permission}\n💬Tin Nhắn Trong Ngày: ${userTotalDay}\n🎖️Hạng Trong Ngày: ${userRankDay + 1}\n💬Tổng Tin Nhắn: ${userTotal}\n🏆Xếp Hạng Tổng: ${userRank + 1}\n📅Tương tác gần đây: ${lastInteraction}\n🔮Cảnh Giới: ${realm}\n\n📌 Thả cảm xúc "❤️" tin nhắn này để xem tổng tin nhắn của toàn bộ thành viên trong nhóm.
`.replace(/^ +/gm, '');
  } else {
    let userList = await Promise.all(storage.map(async item => {
      const userData = await Currencies.getData(item.id);
      const exp = userData.exp;
      const level = LV(exp);
      const realm = getCultivationRealm(level);
      return { ...item, exp, level, realm };
    }));
    
    userList.sort((a, b) => b.count - a.count);

    body = userList.map((item, index) => {
      return `${index + 1}. ${item.name} - ${item.count} tin nhắn \n${item.realm}\n `;
    }).join('-----------------\n');

    const userTotalWeek = threadData.week.find(e => e.id == senderID) ? threadData.week.find(e => e.id == senderID).count : 0;
    const userTotalDay = threadData.day.find(e => e.id == senderID) ? threadData.day.find(e => e.id == senderID).count : 0;
    const tlttd = (userTotalDay / (storage.reduce((a, b) => a + b.count, 0))) * 100;
    const tlttt = (userTotalWeek / (storage.reduce((a, b) => a + b.count, 0))) * 100
    const tltt = (((storage.filter($ => $.id == senderID))[0].count) / (storage.reduce((a, b) => a + b.count, 0))) * 100
    footer = `\n[💬] → Tổng Tin Nhắn: ${storage.reduce((a, b) => a + b.count, 0)}`;
  }

  msg = `${header}\n${body}\n${footer}`;
  return api.sendMessage(msg + '\n' + `${query == 'all' || query == '-a' ? `[🏆] → Bạn hiện đang đứng ở hạng: ${(o.filter(id => id.id == senderID))[0]['rank']}\n───────────────────\n📝 Hướng dẫn lọc thành viên:\n👉 Reply (phản hồi) tin nhắn này theo số thứ tự để xóa thành viên ra khỏi nhóm\n ${global.config.PREFIX}check locmem + số tin nhắn để xóa thành viên ra khỏi nhóm\n ${global.config.PREFIX}check reset -> reset lại toàn bộ dữ liệu tin nhắn\n${global.config.PREFIX}check ndfb -> kick người dùng bị bay acc khỏi nhóm\n${global.config.PREFIX}check box -> xem thông tin nhóm\n${global.config.PREFIX}check call -> tag những người dưới 5 tin nhắn` : ""}`, threadID, (error, info) => {
    if (error) return console.log(error)
    if (query == 'all' || query == '-a') {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        tag: 'locmen',
        thread: threadID,
        author: senderID,
        storage,
      })
    }
    global.client.handleReaction.push({
      name: this.config.name,
      messageID: info.messageID,
      sid: senderID,
    })
  },
  event.messageID);
  threadData = storage = null;
}
this.handleReply = async function({
  api
  , event
  , args
  , handleReply
  , client
  , __GLOBAL
  , permssion
  , Threads
  , Users
  , Currencies
}) {
  try {
    const { senderID } = event
    if (senderID != handleReply.author) return;
    let dataThread = (await Threads.getData(event.threadID)).threadInfo;
    if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage('❎ Bot cần quyền quản trị viên!', event.threadID, event.messageID);
    if (!dataThread.adminIDs.some(item => item.id == senderID)) return api.sendMessage('❎ Bạn không đủ quyền hạn để lọc thành viên!', event.threadID, event.messageID);
    const fs = require('fs');
    let split = event.body.split(" ");

    if (isNaN(split.join(''))) return api.sendMessage(`⚠️ Dữ liệu không hợp lệ`, event.threadID);

    let msg = [], count_err_rm = 0;
    for (let $ of split) {
      let id = handleReply?.storage[$ - 1]?.id;

      if (!!id)try {
        await api.removeUserFromGroup(id, event.threadID);
        msg.push(`${$}. ${global.data.userName.get(id)}`)
      } catch (e) {++count_err_rm;continue};
    };

    api.sendMessage(`🔄 Đã xóa ${split.length-count_err_rm} người dùng thành công, thất bại ${count_err_rm}\n\n${msg.join('\n')}`, handleReply.thread)

  } catch (e) {
    console.log(e)
  }
}
this.handleReaction = async function({ event, api, handleReaction, Threads, Users, Currencies }) {
  try {
    if (event.userID != handleReaction.sid) return;
    if (event.reaction != "❤") return;

    const threadID = event.threadID;
    const fs = require('fs');
    let path_data = path + threadID + '.json';
    
    if (!fs.existsSync(path_data)) {
      return api.sendMessage("⚠️ Không tìm thấy dữ liệu cho nhóm này.", threadID);
    }

    let threadData = JSON.parse(fs.readFileSync(path_data));
  
    let userList = await Promise.all(threadData.total.map(async item => {
      try {
        const userData = await Currencies.getData(item.id);
        const name = await Users.getNameUser(item.id) || 'Facebook User';
        const exp = userData.exp || 0;
        const level = LV(exp);
        const realm = getCultivationRealm(level);
        return { ...item, name, exp, level, realm };
      } catch (error) {
        console.error(`Error processing user ${item.id}:`, error);
        return { ...item, name: 'Unknown User', exp: 0, level: 0, realm: 'Unknown' };
      }
    }));

    userList.sort((a, b) => b.count - a.count);

    let msg = `[ Kiểm Tra Tất Cả Tin nhắn và Tu Tiên ]\n────────────\n`;
    msg += userList.map((item, index) => {
      return `${index + 1}. ${item.name} - ${item.count} tin nhắn\n${item.realm}\n `;
    }).join('-----------------\n');

    msg += `\n────────────\n`;
    msg += `[💬] → Tổng tin nhắn: ${userList.reduce((s, $) => s + $.count, 0)}\n`;
    msg += `[🏆] → Bạn hiện đứng ở hạng: ${userList.findIndex($ => $.id == event.userID) + 1}\n`;
    msg += `───────────────────\n`;
    msg += `📝 Hướng dẫn lọc thành viên:\n`;
    msg += `👉 Reply (phản hồi) tin nhắn này theo số thứ tự để xóa thành viên ra khỏi nhóm\n`;
    msg += ` ${global.config.PREFIX}check locmem + số tin nhắn để xóa thành viên ra khỏi nhóm\n`;
    msg += ` ${global.config.PREFIX}check reset -> reset lại toàn bộ dữ liệu tin nhắn\n`;
    msg += `${global.config.PREFIX}check ndfb -> kick người dùng bị bay acc khỏi nhóm\n`;
    msg += `${global.config.PREFIX}check box -> xem thông tin nhóm\n`;
    msg += `${global.config.PREFIX}check call -> tag những người dưới 5 tin nhắn`;

    api.unsendMessage(handleReaction.messageID);

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) {
        console.error("Error sending message:", err);
        return api.sendMessage("❎ Đã xảy ra lỗi khi gửi tin nhắn.", threadID);
      }
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        tag: 'locmen',
        thread: threadID,
        author: event.userID,
        storage: userList,
      });
    });
  } catch (error) {
    console.error("Error in handleReaction:", error);
    api.sendMessage("❎ Đã xảy ra lỗi khi xử lý phản ứng.", event.threadID);
  }
}

function getCultivationRealm(level) {
  const realms = [
    { name: "Luyện Khí", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Trúc Cơ", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Khai Quang", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Kim Đan", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Nguyên Anh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hóa Thần", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Phản Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Luyện Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hợp Thể", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Đại Thừa", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Độ Kiếp", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Thiên Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Chân Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Kim Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Thánh Nhân", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Đại Thánh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Tiên Đế", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Tiên Tôn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hỗn Độn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Vô Cực", levels: 1, subRealms: ["Viên Mãn"] }
  ];

  let currentLevel = 0;
  for (let realm of realms) {
    if (level > currentLevel && level <= currentLevel + realm.levels) {
      const subRealmIndex = Math.floor((level - currentLevel - 1) / (realm.levels / realm.subRealms.length));
      return `${realm.name} ${realm.subRealms[subRealmIndex]}`;
    }
    currentLevel += realm.levels;
  }

  return "Phàm Nhân";
}

function LV(exp) {
  return Math.floor((Math.sqrt(1 + (4 * exp) / 3) + 1) / 2);
}

