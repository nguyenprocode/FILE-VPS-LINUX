const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const { resolve } = require('path');
const axios = require('axios');
const Youtube = require('youtube-search-api');

const MAX_FILE_SIZE = 250 * 1024 * 1024; // 25MB in bytes

async function getStreamAndInfo(link, path, isVideo) {
  try {
    const info = await ytdl.getInfo(link);
    let format;
    if (isVideo) {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
    } else {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    }
    
    if (!format) throw new Error('No suitable format found');

    const stream = ytdl.downloadFromInfo(info, { format: format });
    return { stream, info, format };
  } catch (error) {
    console.error('Error in getStreamAndInfo:', error);
    throw error;
  }
}

module.exports.config = {
  name: "yt",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "D-Jukie Satoru mod",
  description: "Phát nhạc hoặc video thông qua link YouTube hoặc từ khoá tìm kiếm",
  commandCategory: "Nhạc",
  usages: "[searchMusic]",
  cooldowns: 0
}

module.exports.run = async function ({ api, event, args }) {
  if (args.length == 0) return api.sendMessage('➣ Phần tìm kiếm không được để trống!', event.threadID, event.messageID);
  const keywordSearch = args.join(" ");
  
  try {
    var data = (await Youtube.GetListByKeyword(keywordSearch, false, 6)).items;
    var msg = "🎼 Kết quả tìm kiếm:\n\n";
    for (let i = 0; i < data.length; i++) {
      msg += `${i+1}. ${data[i].title} (${data[i].length.simpleText})\n\n`;
    }
    msg += "✅ Hãy reply tin nhắn này với số thứ tự bài hát bạn muốn";
    
    return api.sendMessage(msg, event.threadID, (error, info) => {
      global.client.handleReply.push({
        type: 'reply',
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        videoData: data
      })
    }, event.messageID);
  } catch(e) {
    console.log(e);
    return api.sendMessage('❌ Đã xảy ra lỗi!', event.threadID, event.messageID);
  }
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author != senderID) return;

  const { videoData } = handleReply;

  if (handleReply.type == 'reply') {
    const choice = parseInt(body);
    if (isNaN(choice) || choice <= 0 || choice > videoData.length) {
      return api.sendMessage('Vui lòng chọn số thứ tự hợp lệ!', threadID, messageID);
    }

    const selectedVideo = videoData[choice - 1];
    api.unsendMessage(handleReply.messageID);
    const msg = `Bạn đã chọn: ${selectedVideo.title}\nVui lòng reply tin nhắn này với lựa chọn của bạn:\n1.🎧 Tải MP3\n2.🎬 Tải Video`;
    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        type: 'format',
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title
      })
    }, messageID);
  } else if (handleReply.type == 'format') {
    const format = body;
    if (format !== '1' && format !== '2') {
      return api.sendMessage('Vui lòng chọn 1 (MP3) hoặc 2 (Video)!', threadID, messageID);
    }

    const isVideo = format === '2';
    const outputPath = `${__dirname}/cache/sing-${senderID}.${isVideo ? 'mp4' : 'mp3'}`;
    api.unsendMessage(handleReply.messageID);

    try {
      api.sendMessage("Đang xử lý yêu cầu của bạn...", threadID, messageID);

      const { stream, info, format: chosenFormat } = await getStreamAndInfo(`https://www.youtube.com/watch?v=${handleReply.videoId}`, outputPath, isVideo);

      let fileSize = 0;
      stream.on('data', (chunk) => {
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          stream.destroy();
          fs.unlinkSync(outputPath);
          api.sendMessage('❌ Kích thước file vượt quá giới hạn 25MB!', threadID, messageID);
        }
      });

      stream.pipe(fs.createWriteStream(outputPath));

      stream.on('end', () => {
        if (fileSize <= MAX_FILE_SIZE) {
          const message = {
            body: `🎵 Bài hát: ${info.videoDetails.title}
⏱️ Thời lượng: ${this.convertHMS(info.videoDetails.lengthSeconds)}
👤 Kênh: ${info.videoDetails.author.name}
👀 Lượt xem: ${info.videoDetails.viewCount}
👍 Lượt thích: ${info.videoDetails.likes}
📅 Ngày đăng: ${this.formatDate(info.videoDetails.uploadDate)}
📁 Định dạng: ${isVideo ? 'Video' : 'MP3'}
🔊 Bitrate: ${chosenFormat.audioBitrate || 'N/A'} kbps
📺 Độ phân giải: ${chosenFormat.qualityLabel || 'N/A'}`,
            attachment: fs.createReadStream(outputPath)
          }
          api.sendMessage(message, threadID, () => fs.unlinkSync(outputPath), messageID);
        }
      });

    } catch (e) {
      console.log(e);
      return api.sendMessage('Đã xảy ra lỗi khi xử lý yêu cầu của bạn!', threadID, messageID);
    }
  }
}

module.exports.convertHMS = function(value) {
  const sec = parseInt(value, 10); 
  let hours   = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60); 
  let seconds = sec - (hours * 3600) - (minutes * 60); 
  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return (hours != '00' ? hours +':': '') + minutes+':'+seconds;
}

module.exports.formatDate = function(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}