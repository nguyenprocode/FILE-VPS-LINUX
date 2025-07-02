/*
@credit ⚡️D-Jukie
@vui lòng không chỉnh sửa credit
*/
module.exports.config = {
    name: "work",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "⚡D-Jukie", 
    description: "Làm việc để có tiền, có làm thì mới có ăn",
    commandCategory: "Money",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 21600000
    }
};
module.exports.languages = {
    "vi": {
        "cooldown": "Bạn đã làm việc rồi, quay lại sau: %1 phút %2 giây."      
    },
    "en": {
        "cooldown": "⚡️You're done, come back later: %1 minute(s) %2 second(s)."
    }
}
module.exports.handleReply = async ({ event, api, handleReply, Currencies, getText }) => {
    const { threadID, messageID, senderID } = event;
  if (senderID !== handleReply.author) return api.sendMessage("Chỗ người khác đang mần ăn, cút đi chỗ khác chơi 🙂", threadID, messageID);
    let data = (await Currencies.getData(senderID)).data || {};
//random coins nhận được khi làm việc ít nhất 200
var coinscn = Math.floor(Math.random() * 100000); //random coins khi làm ở khu công nghiệp
var coinsdv = Math.floor(Math.random() * 100000); //random coins khi làm ở khu dịch vụ
var coinsmd = Math.floor(Math.random() * 100000); //random coins khi làm ở mỏ dầu
var coinsq = Math.floor(Math.random() * 100000); //random coins khi khai thác quặng
var coinsdd = Math.floor(Math.random() * 100000); //random coins khi đào đá
var coinsdd1 = Math.floor(Math.random() * 100000); //random coins khi đào đá
var coinsex1 = Math.floor(Math.random() * 100000);
var coinsex12 = Math.floor(Math.random() * 100000);
var coinsex13 = Math.floor(Math.random() * 100000);
//random công việc cần làm
var rdcn = ['tuyển dụng nhân viên', 'quản trị khách sạn', 'tại nhà máy điện', 'đầu bếp trong nhà hàng', 'công nhân']; //random công việc khi làm ở khu công nghiệp
var work1 = rdcn[Math.floor(Math.random() * rdcn.length)];   

var rddv = ['sửa ống nước', 'sửa điều hòa cho hàng xóm', 'bán hàng đa cấp', 'phát tờ rơi', 'shipper', 'sửa máy vi tính', 'hướng dẫn viên du lịch', 'cho con bú']; //random công việc khi làm ở khu dịch vụ
var work2 = rddv[Math.floor(Math.random() * rddv.length)]; 

var rdmd = ['kiếm được 13 thùng dầu', 'kiếm được 8 thùng', 'kiếm được 9 thùng dầu', 'kiếm được 8 thùng dầu', 'ăn cướp dầu ', 'lấy nước đổ vô dầu rồi bán']; //random công việc khi làm ở mỏ dầu
var work3 = rdmd[Math.floor(Math.random() * rdmd.length)]; 

var rdq = ['quặng sắt', 'quặng vàng', 'quặng than', 'quặng chì', 'quặng đồng ', 'quặng dầu']; //random công việc khi khai thác quặng
var work4 = rdq[Math.floor(Math.random() * rdq.length)]; 

var rddd = ['kim cương', 'vàng', 'than', 'ngọc lục bảo', 'sắt ', 'đá bình thường', 'lưu ly', 'đá xanh']; //random công việc khi đào đá
var work5 = rddd[Math.floor(Math.random() * rddd.length)]; 

var rddd1 = ['khách vip', 'khách quen', 'người lạ', 'thằng ngu tầm 23 tuổi', 'anh lạ mặt chim to', 'khách quen', 'đại gia 100 tuổi', 'thằng nhóc 10 tuổi', 'sugar daddy', 'thằng si đa']; //random công việc khi đào đá
var work6 = rddd1[Math.floor(Math.random() * rddd1.length)];

var rdex1 = ['làm ô sin cho admin' ,'chùi bồn cầu ', 'bắt cướp', 'làm đĩ', 'chat sex với admin', 'thủ dâm', 'sủa gâu gâu']; //random công việc khi thử thách 
var work7 = rdex1[Math.floor(Math.random() * rdex1.length)];

  var rdex12 = ['thu tiền bảo kê', 'dành lãnh địa bàn', 'bán ma túy', 'buôn bán mại dâm', 'buôn lậu', 'cướp ngân hàng', 'bán vũ khí']; //random công việc khi thử thách 
var work8 = rdex12[Math.floor(Math.random() * rdex12.length)];
  
var rdex13 = ['Cá Thu', 'Cá Sấu', 'Cá Mập', 'Cá Heo', 'Cá Voi Sát Thủ', 'Mực Ma', 'Tôm Hùm Alaska', 'Cá Voi Xanh', 'Rùa Leviathanochelys aenigmatica', 'Sứa Stygiomedusa gigantea', 'Cua Hoàng Đế', 'Cá Hồi Đại Dương', 'Cá Bò Picasso', 'Cá Bướm Mỏ Nhọn', 'Cá Hồng Y', 'Cá Hề', 'Tôm Tít', 'Cá Chim Hoàng Đế', 'Hải Sâm', 'Cá Mao Tiên', 'Cá Bắp Nẻ Xanh', 'Cá Nóc', 'Cá Đuối', 'Cá Bò Hòm', 'Bạch Tuộc Dumbo', 'Cá Mặt Trăng', 'Cá Mập Megalodon', 'Cá Nhà Táng', 'Cá Voi Lưng Gù', 'Cá Ngựa', 'Cá Ngừ', 'Cá Cam', 'Cá Đuôi Gai Vàng', 'Cá Mập Đầu Búa', 'Cá Mập Pliotrema Kajae', 'Mực Colossal', 'Người Cá', 'Cá Bubble Eye', 'Cá Mập Greenland', 'Cá Oarfish', 'Cua Nhện']; //random công việc khi thử thách 
var work9 = rdex13[Math.floor(Math.random() * rdex13.length)];

var rdex0 = ['Đại Tây Dương', 'Thái Bình Dương', 'Tam Giác Quỷ', 'Bắc Băng Dương', 'Ấn Độ Dương', 'Nam Đại Dương', 'Vùng caribe', 'Châu Đại Đương', 'vùng Australia', 'Philippines', 'San Hô', 'Đông', 'Nam Cực', 'Địa Trung Hải', 'Bering', 'Tây Ban Nha', 'Vịnh Mexico', 'Vịnh Monterey']; //random công việc khi thử thách 
var lo = rdex0[Math.floor(Math.random() * rdex0.length)];

var msg = "";
    switch(handleReply.type) {
        case "choosee": {
            
            switch(event.body) {
                case "1": msg = `Bạn đang làm việc ${work1} ở khu công nghiệp và kiếm được ${coinscn}$` ;await Currencies.increaseMoney(event.senderID, parseInt(coinscn)); break;             
                case "2": msg = `Bạn đang làm việc ${work2} ở khu dịch vụ và kiếm được ${coinsdv}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsdv)); break;
                case "3": msg = `Bạn ${work3} tại khu mở dầu và bán được ${coinsmd}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsmd)); break;
                case "4": msg = `Bạn đang khai thác ${work4} và kiếm được ${coinsq}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsq)); break;
                case "5": msg = `Bạn đào được ${work5} và kiếm được ${coinsdd}$` ; await Currencies.increaseMoney(event.senderID, parseInt(coinsdd)); break;
                case "6": msg = `Bạn được ${work6} cho ${coinsdd1}$ nếu chịt 1 đêm, thế là bạn đồng ý chịt ngay 🤤`; await Currencies.increaseMoney(event.senderID, parseInt(coinsdd1)); break;
               case "7": msg = `Bạn vừa nhận thử thách 24h ${work7} và nhận được ${coinsex1}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsex1)); break;
                case "8": msg = `Bạn vừa ${work8} ở khu cao lầu và kiếm về ${coinsex12}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsex12)); break;
                case "9": msg = `🎣 Bạn vừa câu dính ${work9} ở Biển ${lo} và bán được ${coinsex13}$`; await Currencies.increaseMoney(event.senderID, parseInt(coinsex13)); break; //thêm case nếu muốn 
                case "10": msg = "Đanh update...";
                default: break;
            };
            const choose = parseInt(event.body);
            if (isNaN(event.body)) return api.sendMessage("Vui lòng nhập 1 con số", event.threadID, event.messageID);
            if (choose > 10 || choose < 1) return api.sendMessage("Lựa chọn không nằm trong danh sách.", event.threadID, event.messageID); //thay số case vào số 7
            api.unsendMessage(handleReply.messageID);
            if (msg == "Chưa update...") {
                msg = "Update soon...";
            };
            return api.sendMessage(`${msg}`, threadID, async () => {
            
            
        });

    };
}
}
module.exports.run = async ({  event, api, handleReply, Currencies, getText }) => {
    const { threadID, messageID, senderID } = event;
    const cooldown = global.configModule[this.config.name].cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};
    //cooldownTime cho mỗi lần nhận 
    if (typeof data !== "undefined" && cooldown - (Date.now() - data.work2Time) > 0) {

        var time = cooldown - (Date.now() - data.work2Time),
            minutes = Math.floor(time / 60000),
            seconds = ((time % 60000) / 1000).toFixed(0); 
        return api.sendMessage(getText("cooldown", minutes, (seconds < 10 ? "0" + seconds : seconds)), event.threadID, event.messageID);
    }
    else {    
    return api.sendMessage("===[ KIẾM TIỀN MỖI NGÀY ]===" +
                "\n──────────────────\n1. Khu công nghiệp 🏭" +
                "\n2. Khu dịch vụ 💡" +
                "\n3. Khu mỏ dầu 💎" +
                "\n4. Khai thác quặng ⛏️" +
                "\n5. Đào đá 🔨" +
                "\n6. Làm đĩ =))" +
                "\n7. Thử thách ⛩️" +                 "\n8. Khu cao lầu 🏰" +
                "\n9. Câu cá 🎣" +
                "\n10. Đang update..." + "\n──────────────────\n→ Hãy reply tin nhắn và chọn theo số thứ tự." //thêm hiển thị case tại đây ||  \n[number]. [Ngành nghề]" +
            , event.threadID, (error, info) => {
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: event.senderID,
            messageID: info.messageID
          });
                          data.work2Time = Date.now();
             Currencies.setData(senderID, { data });
        })
    }
}