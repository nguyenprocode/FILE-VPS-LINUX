const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const configPath = path.join(__dirname, 'spotify', 'spotify.json');
let spotifyConfig;

try {
  spotifyConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Lỗi khi đọc file cấu hình Spotify:', error);
  spotifyConfig = { clientId: '', clientSecret: '' };
}

module.exports.config = {
  name: "spt",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "Satoru",
  description: "Tìm kiếm, hiển thị thông tin và phát nhạc từ Spotify",
  commandCategory: "Nhạc",
  usages: "[tên bài hát]",
  cooldowns: 5,
};

let streamURL = (url, ext = 'jpg') => axios.get(url, {
    responseType: 'stream',
}).then(res => (res.data.path = `tmp.${ext}`, res.data)).catch(e => null);

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  if (senderID != handleReply.author) return;
  
  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.tracks.length) {
    return api.sendMessage("Lựa chọn không hợp lệ. Vui lòng chọn một số từ danh sách.", threadID, messageID);
  }
  const selectedTrack = handleReply.tracks[choice - 1];
  
  try {
    const downloadData = await getSpotifyTrackDownloadLink(selectedTrack.id);
    const audioStream = await streamURL(downloadData.link, 'mp3');
    
    if (audioStream) {
      api.unsendMessage(handleReply.messageID);
      
      let msg = `🎵 ====[ MUSIC PLAY ]==== 🎵\n`;
      msg += `▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱\n`;
      msg += `📌 Tên: ${downloadData.metadata.title}\n`;
      msg += `🎤 Nghệ sĩ: ${downloadData.metadata.artists}\n`;
      msg += `💽 Album: ${downloadData.metadata.album}\n`;
      msg += `📅 Ngày phát hành: ${formatDate(downloadData.metadata.releaseDate)}\n`;
      msg += `⇆ㅤㅤㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤㅤㅤ↻\n`;
      msg += `▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱`

      api.sendMessage(
        {
          body: msg,
          attachment: audioStream,
        },
        threadID,
        (error, info) => {
          if (error) {
            console.error(error);
            api.sendMessage("❌ Có lỗi xảy ra khi gửi bài hát. Vui lòng thử lại sau.", threadID, messageID);
          }
        }
      );
    } else {
      api.sendMessage("❌ Có lỗi xảy ra khi tải bài hát. Vui lòng thử lại sau.", threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  if (args.length === 0) {
    return api.sendMessage("⚠️ Vui lòng nhập tên bài hát bạn muốn tìm kiếm.", threadID, messageID);
  }

  const searchQuery = args.join(" ");
  
  try {
    const searchResults = await spotifySearch(searchQuery, 6);
    
    if (searchResults.length === 0) {
      return api.sendMessage("❌ Không tìm thấy bài hát nào phù hợp.", threadID, messageID);
    }

    let msg = "🎵 Đây là kết quả tìm kiếm cho bài hát của bạn:\n\n";
    searchResults.forEach((track, index) => {
      msg += `${index + 1}. ${track.name}\n🎙️ Ca sĩ: ${track.artists.map(a => a.name).join(", ")}\n-----------------\n`;
    });
    msg += "👉 Reply với số thứ tự để chọn bài hát bạn muốn nghe.";

    api.sendMessage(msg, threadID, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          tracks: searchResults
        });
      }
    }, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn.", threadID, messageID);
  }
};

async function spotifySearch(keywords, limit = 5) {
  const tokenPath = path.join(__dirname, 'spotify', 'token.json');

  async function getAccessToken() {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', 
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(spotifyConfig.clientId + ':' + spotifyConfig.clientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.message);
      throw error;
    }
  }

  async function refreshAccessToken() {
    const token = await getAccessToken();
    fs.writeFileSync(tokenPath, JSON.stringify({ token, timestamp: Date.now() }, null, 2));
    return token;
  }

  async function getValidToken() {
    if (!fs.existsSync(tokenPath)) {
      return await refreshAccessToken();
    }

    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const tokenAge = (Date.now() - tokenData.timestamp) / 1000 / 60; // age in minutes

    if (tokenAge > 50) {
      return await refreshAccessToken();
    }

    return tokenData.token;
  }

  try {
    const token = await getValidToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: keywords,
        type: 'track',
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data || !response.data.tracks || !response.data.tracks.items) {
      throw new Error('Invalid API response structure');
    }

    return response.data.tracks.items;
  } catch (error) {
    console.error('Error during Spotify search:', error.message);
    if (error.response && error.response.status === 401) {
      await refreshAccessToken();
      return spotifySearch(keywords, limit);
    }
    throw error;
  }
}

async function getSpotifyTrackDownloadLink(trackId) {
  try {
    const response = await axios.get(`https://api.spotifydown.com/download/${trackId}`, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Origin': 'https://spotifydown.com',
        'Referer': 'https://spotifydown.com/',
        'Sec-Ch-Ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
      }
    });

    if (response.data.success && response.data.link) {
      return response.data;
    } else {
      throw new Error('Failed to fetch track download link');
    }
  } catch (error) {
    console.error('Error fetching Spotify track download link:', error);
    throw error;
  }
}