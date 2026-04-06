const NovaUltra = {
command: ["سبام"],
description: "تشغيل أو إيقاف حماية السبام",
group: true,
admin: true
};

const spamEnabled = new Map();
const userMessages = new Map();

async function execute({ sock, msg, args }) {

const chatId = msg.key.remoteJid;

if(args[0] === "تشغيل"){

spamEnabled.set(chatId,true);

await sock.sendMessage(chatId,{
text:"🛡 تم تشغيل نظام مكافحة السبام."
},{quoted:msg});

}

else if(args[0] === "ايقاف"){

spamEnabled.delete(chatId);

await sock.sendMessage(chatId,{
text:"⛔ تم إيقاف نظام السبام."
},{quoted:msg});

}

}

export async function autoRespond(sock,msg){

const chatId = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;

if(!spamEnabled.has(chatId)) return;

const key = chatId + sender;

if(!userMessages.has(key)){
userMessages.set(key,[]);
}

const list = userMessages.get(key);

const now = Date.now();

list.push({
time:now,
id:msg.key.id
});

// الاحتفاظ فقط برسائل آخر 20 ثانية
const filtered = list.filter(m => now - m.time <= 20000);

userMessages.set(key,filtered);

// إذا وصل إلى 7 رسائل
if(filtered.length >= 7){

for(const m of filtered){

await sock.sendMessage(chatId,{
delete:{
remoteJid:chatId,
id:m.id,
participant:sender
}
});

}

await sock.sendMessage(chatId,{
text:`🚫 تم اكتشاف سبام من @${sender.split("@")[0]}`,
mentions:[sender]
});

userMessages.set(key,[]);

}

}

export default { NovaUltra, execute, autoRespond };