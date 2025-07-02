module.exports.config = {
	name: "6mui",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Vtuan",
	description: "Xem trai 6 múi",
	commandCategory: "Ảnh",
	usages: "",
	cooldowns: 2,
        usePrefix: false
};
module.exports.run = async ({ api, event ,Users}) => {
	const axios = require('axios');
	const request = require('request');
	const fs = require("fs");
	const links = require("./../../gojo/datajson/6mui.json");
    const data = links[Math.floor(Math.random() * links.length)];
    var array = [];
    var downloadfile1 = (await axios.get(data, {responseType: 'stream'})).data;
    array.push(downloadfile1); 
					api.sendMessage({
						body: `Mê trai đầu thai mới hết :3`,
						attachment: array}, event.threadID, event.messageID);
				
			
}