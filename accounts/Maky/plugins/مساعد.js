// plugins/الذكاء/مساعد.js
import axios from "axios";

// مفتاح API (يفضل وضعه في environment)
const GROQ_KEY = process.env.GROQ_KEY || "PUT_KEY_HERE";

// حالة المساعد في كل مجموعة
const assistantStatus = new Map();

// ذاكرة المحادثة
const chatMemory = new Map();

// منع السبام
const lastReply = new Map();

let isGlobalActive = true;

export const NovaUltra = {
command: "مساعد",
description: "تفعيل أو إيقاف المساعد الذكي",
category: "الذكاء",
elite: "off",
group: true,
prv: false,
lock: "off",
admin: true
};

export async function autoRespond(sock, msg, text) {

const chatId = msg.key.remoteJid;

if (!chatId.endsWith("@g.us")) return false;

// اذا البوت مطفأ
if (assistantStatus.get(chatId) === false || !isGlobalActive) return false;

// تجاهل رسائل البوت
if (msg.key.fromMe) return false;

// تجاهل الاوامر
if (text.startsWith(".") || text.startsWith("!")) return false;

// تجاهل الرسائل القصيرة
if (!text || text.length < 5) return false;

// التحقق أن الرسالة رد على البوت
const context = msg.message?.extendedTextMessage?.contextInfo;

const isReplyToBot =
context?.participant === sock.user.id ||
context?.quotedMessage;

if (!isReplyToBot) return false;

// منع الرد السريع
const now = Date.now();
const last = lastReply.get(chatId) || 0;

if (now - last < 20000) return false;

lastReply.set(chatId, now);

try {

// تأخير عشوائي حتى يبدو طبيعي
const delay = Math.floor(Math.random() * 7000) + 5000;
await new Promise(r => setTimeout(r, delay));

// ذاكرة المحادثة
let history = chatMemory.get(chatId) || [];

history.push({
role: "user",
content: text
});

// حد الذاكرة
if (history.length > 8) history.shift();

chatMemory.set(chatId, history);

// الاتصال بـ API
const response = await axios.post(
"https://api.groq.com/openai/v1/chat/completions",
{
model: "llama3-70b-8192",
messages: [
{
role: "system",
content: `
أنت عضو عادي في مجموعة واتساب.
تكلم بشكل طبيعي وبسيط.
ردودك قصيرة.
لا تذكر أنك ذكاء اصطناعي.
لا ترد إذا لم يكن الكلام موجهاً لك.
استخدم ايموجي أحياناً.
`
},
...history
],
temperature: 0.9,
max_tokens: 60
},
{
headers: {
Authorization: `Bearer ${GROQ_KEY}`,
"Content-Type": "application/json"
}
}
);

const reply = response.data.choices[0].message.content;

// حفظ رد البوت في الذاكرة
history.push({
role: "assistant",
content: reply
});

chatMemory.set(chatId, history);

// ارسال الرد
await sock.sendMessage(
chatId,
{
text: reply
},
{ quoted: msg }
);

console.log("🤖 assistant reply:", reply);

return true;

} catch (err) {

console.log("assistant error:", err.message);
return false;

}

}

async function execute({ sock, msg, args }) {

const chatId = msg.key.remoteJid;
const action = args[0]?.toLowerCase();

if (!chatId.endsWith("@g.us")) {

await sock.sendMessage(chatId,{
text:"⚠️ هذا الأمر يعمل في المجموعات فقط"
},{quoted:msg});

return;

}

// ايقاف
if (action === "ايقاف" || action === "off") {

assistantStatus.set(chatId,false);

await sock.sendMessage(chatId,{
text:"🔇 تم إيقاف المساعد في هذه المجموعة"
},{quoted:msg});

return;

}

// تشغيل
if (action === "تشغيل" || action === "on") {

assistantStatus.set(chatId,true);

await sock.sendMessage(chatId,{
text:"🤖 تم تشغيل المساعد الذكي"
},{quoted:msg});

return;

}

// عرض الحالة
const status = assistantStatus.get(chatId);

await sock.sendMessage(chatId,{
text: status ? "🟢 المساعد مفعل" : "🔴 المساعد متوقف"
},{quoted:msg});

}

export default { NovaUltra, execute, autoRespond };