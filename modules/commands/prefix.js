module.exports.config = {
    name: "prefix",	
    version: "4.0.0", 
    hasPermssion: 0,
    credits: "Vtuan",
    description: "sos", 
    commandCategory: "Box",
    usages: "",
    cooldowns: 0
  };
  
module.exports.handleEvent = async function ({ api, event, Threads }) {
    const request = require('request');
    const fs = require("fs");
    var { threadID, messageID, body } = event,{ PREFIX } = global.config;
    let threadSetting = global.data.threadData.get(threadID) || {};
    let prefix = threadSetting.PREFIX || PREFIX;
    const timeStart = Date.now();
    if (body == "Prefix" || (body == "prefix")) {
            return api.sendMessage({
          body: `ㅤㅤㅤ『 ${global.config.BOTNAME} 』ㅤㅤㅤ\n→𝙿𝚛𝚎𝚏𝚒𝚡 𝚌𝚞̉𝚊 𝚗𝚑𝚘́𝚖: ${prefix}\n→𝙿𝚛𝚎𝚏𝚒𝚡 𝚑𝚎̣̂ 𝚝𝚑𝚘̂́𝚗𝚐: ${global.config.PREFIX}`},event.threadID,event.messageID);
   }
  }
module.exports.run = async ({ api, event, args, Threads }) => {}
  
  
  