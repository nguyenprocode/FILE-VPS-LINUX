const axios = require('axios');

function convert(time) {
  const date = new Date(time);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} lúc ${date.getHours()}:${date.getMinutes()}`;
}

async function getUserInfo({ api, event, args, Currencies }) {
  let token = 'EAAAAUaZA8jlABO365bwBP7XbEaNhafJnZANbGidqrexvee04M3zmYRw39p69yaQmo2PIFHe8KZAzRKcp0RYHBtkJbCARzuz5FYbLodFqrixyxI7YucdMmVxxBaSpSJB8v4UrLYT88833adpVzODaitjRO6S8ZBjM4qdPQDE7WSUvmFHr3iBWMfyCK2Ouuc3KMZAaQHE1RfwZDZD', id;
  
  id = Object.keys(event.mentions).length > 0 
    ? Object.keys(event.mentions)[0].replace(/\&mibextid=ZbWKwL/g,'')
    : args[0] ? (isNaN(args[0]) ? await global.utils.getUID(args[0]) : args[0]) : event.senderID;

  if (event.type === "message_reply") id = event.messageReply.senderID;

  try {
    api.sendMessage('🔄 Đang lấy thông tin...', event.threadID, event.messageID);

    const resp = await axios.get(`https://graph.facebook.com/${id}?fields=id,is_verified,cover,updated_time,work,education,likes,work,posts,hometown,username,family,timezone,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.limit(0)&access_token=${token}`);

    const info = {
      name: resp.data.name,
      username: resp.data.username || "❎",
      link_profile: resp.data.link,
      bio: resp.data.about || "Không có tiểu sử",
      gender: resp.data.gender === 'male' ? 'Nam' : resp.data.gender === 'female' ? 'Nữ' : '❎',
      relationship_status: resp.data.relationship_status || "Không có",
      rela: resp.data.significant_other?.name || '',
      bday: resp.data.birthday || "Không công khai",
      follower: resp.data.subscribers?.summary?.total_count || "❎",
      is_verified: resp.data.is_verified ? "✔️ Đã xác minh" : "❌ Chưa xác minh",
      locale: resp.data.locale || "❎",
      hometown: resp.data.hometown?.name || "Không công khai",
      cover: resp.data.cover?.source || null,
      ban: global.data.userBanned.has(id) ? "Đang bị ban" : "Không bị ban",
      money: ((await Currencies.getData(id)) || {}).money || 0,
      avatar: `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=${token}`,
    };

    const infoMessage = `==== [ 𝚄𝚂𝙴𝚁 𝙸𝙽𝙵𝙾 ] ====\n
|› Tên: ${info.name}
|› User name: ${info.username}
|› Link trang cá nhân: ${info.link_profile}
|› Giới tính: ${info.gender}
|› Mối quan hệ: ${info.relationship_status} ${info.rela}
|› Sinh nhật: ${info.bday}
|› Tiểu sử: ${info.bio}
|› Nơi sinh: ${info.hometown}
|› Số follow: ${info.follower.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
|› Quốc gia: ${info.locale}
|› Cập nhật lần cuối: ${convert(resp.data.updated_time)}
|› Múi giờ số: ${resp.data.timezone}
⛔ Kiểm tra cấm: ${info.ban}
📌 Tiền hiện có: ${info.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    const attachments = [];

    if (info.cover) {
      try {
        const coverPhoto = await axios.get(info.cover, { responseType: 'stream' });
        attachments.push(coverPhoto.data);
      } catch (error) {
        api.sendMessage('Không thể truy xuất ảnh bìa.', event.threadID, event.messageID);
      }
    }

    try {
      const avatarPhoto = await axios.get(info.avatar, { responseType: 'stream' });
      attachments.push(avatarPhoto.data);
    } catch (error) {
      api.sendMessage('Không thể truy xuất avatar.', event.threadID, event.messageID);
    }

    api.sendMessage({ body: infoMessage, attachment: attachments }, event.threadID, (err, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: id
      });
    }, event.messageID);
    
  } catch (error) {
    api.sendMessage(`Đã xảy ra lỗi: ${error.message}`, event.threadID, event.messageID);
  }
}

module.exports.handleReaction = async function({ api, event, handleReaction }) {
  if (event.reaction === '😆' && event.userID === handleReaction.author) {
    try {
      const resp = await axios.get(`https://graph.facebook.com/${handleReaction.author}?fields=posts&access_token=${global.config.ACCESSTOKEN}`);
      const posts = resp.data.posts;
      let postList = '';

      if (!posts || posts.data.length === 0) {
        postList = '❎ Không có bài đăng nào!';
      } else {
        for (let i = 0; i < Math.min(5, posts.data.length); i++) {
          const post = posts.data[i];
          postList += `⏰ Tạo lúc: ${convert(post.created_time)}\n📝 Nội dung: ${post.message || 'Không có nội dung'}\n🔗 Link: ${post.actions[0].link}\n────────────────\n`;
        }
      }

      api.sendMessage(postList, event.threadID);
    } catch (error) {
      api.sendMessage('Lỗi khi lấy bài đăng: ' + error.message, event.threadID);
    }
  }
};

module.exports.run = getUserInfo;

module.exports.config = {
  name: "info",
  usePrefix: true,
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Tiến",
  description: "Lấy thông tin người dùng Facebook",
  commandCategory: "Tiện ích",
  usages: "[uid/link/@tag]",
  cooldowns: 5,
};