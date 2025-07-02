module.exports.config = {
  name: "autosend",
  version: "1.0.3",
  hasPermssion: 1,
  credits: "Satoru",
  description: "Tự động gửi tin nhắn theo lịch, có thể kèm ảnh/video",
  commandCategory: "Tiện ích",
  usages: "[add/remove/list]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "path": "",
    "moment-timezone": "",
    "axios": ""
  }
}

const { readFileSync, writeFileSync } = require('fs-extra');
const { resolve } = require('path');
const path = resolve(__dirname, 'cache', "autosenddata.json");

let format_attachment = type => ({
  photo: 'png', video: 'mp4', audio: 'mp3', animated_image: 'gif',
})[type] || 'bin';

module.exports.onLoad = function ({ api }) {
  const { existsSync, writeFileSync } = require('fs-extra');
  if (!existsSync(path)) writeFileSync(path, JSON.stringify([]));
  
  setInterval(async function () {
    const data = JSON.parse(readFileSync(path));
    const moment = require("moment-timezone");
    const now = moment().tz("Asia/Ho_Chi_Minh").format('HH:mm:ss');
    
    data.forEach(thread => {
      thread.autosend.forEach(async item => {
        if (item.time === now) {
          const msg = { body: item.message };
          if (item.attachment) {
            if (item.attachment === 'girl') {
              msg.attachment = global.a.splice(0, 1);
            } else if (item.attachment === 'boy') {
              msg.attachment = global.b.splice(0, 1);
            } else if (/^https?:\/\//.test(item.attachment)) {
              msg.attachment = await stream_url(item.attachment);
            }
          }
          api.sendMessage(msg, thread.threadID);
        }
      });
    });
  }, 1000);
}

async function stream_url(url) {
  const axios = require('axios');
  return (await axios.get(url, { responseType: 'stream' })).data;
}

async function catbox(link, type) {
  const fs = require('fs');
  const axios = require('axios');
  const FormData = require('form-data');
  const path = require('path');
  const filePath = path.join(__dirname, 'cache', `${Date.now()}.${type}`);
  const response = await axios({ method: 'GET', url: link, responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => writer.on('finish', resolve).on('error', reject));
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', fs.createReadStream(filePath));
  const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
    headers: formData.getHeaders(),
  });
  fs.unlinkSync(filePath);
  return uploadResponse.data;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const data = JSON.parse(readFileSync(path));
  let threadData = data.find(item => item.threadID == threadID);
  
  switch (args[0]) {
    case "add":
      if (!threadData) {
        threadData = { threadID, autosend: [] };
        data.push(threadData);
      }
      
      return api.sendMessage("Nhập nội dung tin nhắn:", threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "content"
        });
      }, messageID);
      
    case "remove":
      if (!threadData || threadData.autosend.length === 0) 
        return api.sendMessage("Chưa có tin nhắn tự động nào được cài đặt", threadID, messageID);
      
      return api.sendMessage(`Nhập số thứ tự muốn xóa (1-${threadData.autosend.length}):`, threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "remove"
        });
      }, messageID);
      
    case "list":
      if (!threadData || threadData.autosend.length === 0) 
        return api.sendMessage("Chưa có tin nhắn tự động nào được cài đặt", threadID, messageID);
      
      const list = threadData.autosend.map((item, index) => 
        `${index + 1}. Gửi lúc ${item.time}: ${item.message} ${item.attachment ? `(có đính kèm)` : ''}`
      ).join('\n');
      
      return api.sendMessage(`Danh sách tin nhắn tự động:\n${list}`, threadID, messageID);
      
    default:
      return api.sendMessage("Sử dụng: autosend [add/remove/list]", threadID, messageID);
  }
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body, attachments } = event;
  if (handleReply.author != senderID) return;
  
  const data = JSON.parse(readFileSync(path));
  let threadData = data.find(item => item.threadID == threadID);
  
  switch (handleReply.type) {
    case "content":
      return api.sendMessage("Nhập thời gian gửi (HH:mm:ss):", threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "time",
          content: body
        });
      }, messageID);
      
    case "time":
      const moment = require("moment-timezone");
      if (!moment(body, "HH:mm:ss").isValid()) 
        return api.sendMessage("Định dạng thời gian không hợp lệ", threadID, messageID);
      
      return api.sendMessage("Gửi ảnh/video đính kèm, hoặc nhập 'girl', 'boy', URL của ảnh/video (hoặc 's' nếu không cần):", threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "attachment",
          content: handleReply.content,
          time: body
        });
      }, messageID);
      
    case "attachment":
      let uri = body;
      if (!['s','girl','boy'].includes(body)){
        if (attachments.length === 0) return api.sendMessage('⚠️ Chưa nhập tệp đính kèm', threadID, messageID);
        const d = attachments[0].type === "photo" ? "jpg" :
          attachments[0].type === "video" ? "mp4" :
          attachments[0].type === "audio" ? "m4a" :
          attachments[0].type === "animated_image" ? "gif" :
          "txt";
        try {
          uri = await catbox(attachments[0].url, d);
        } catch(e) {
          console.error(e);
          return api.sendMessage('⚠️ Không thể upload', threadID, messageID);
        };
      };
      
      threadData.autosend.push({
        message: handleReply.content,
        time: handleReply.time,
        attachment: uri === 's' ? null : uri
      });
      
      writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("Đã thêm tin nhắn tự động", threadID, messageID);
      
    case "remove":
      const index = parseInt(body) - 1;
      if (isNaN(index) || index < 0 || index >= threadData.autosend.length)
        return api.sendMessage("Số thứ tự không hợp lệ", threadID, messageID);
      
      threadData.autosend.splice(index, 1);
      writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("Đã xóa tin nhắn tự động", threadID, messageID);
  }
}