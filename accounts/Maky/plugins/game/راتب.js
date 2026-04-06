// plugins/النظام/راتب.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ بيانات المستخدمين
const userDataFile = path.join(__dirname, '../nova/data/users.json');

// التأكد من وجود المجلد والملف
const dataDir = path.join(__dirname, '../nova/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(userDataFile)) fs.writeFileSync(userDataFile, JSON.stringify({}));

// دوال مساعدة
function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveUsers(data) {
    fs.writeFileSync(userDataFile, JSON.stringify(data, null, 2), 'utf8');
}

// دالة تحويل الوقت
function msToTime(duration) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة ${minutes} دقيقة`;
}

export const NovaUltra = {
    command: ["راتب"],
    description: "الحصول على المكافأة اليومية",
    category: "نظام",
    elite: "off",
    group: true,
    prv: true,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    
    // تحميل بيانات المستخدمين
    const users = loadUsers();
    
    // تهيئة بيانات المستخدم إذا لم تكن موجودة
    if (!users[senderNumber]) {
        users[senderNumber] = {
            points: 0,
            lastDaily: 0,
            diamonds: 0,
            coins: 0
        };
    }
    
    const user = users[senderNumber];
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 ساعة
    
    // التحقق من الوقت
    if (user.lastDaily && (now - user.lastDaily) < cooldown) {
        const remaining = cooldown - (now - user.lastDaily);
        const timeLeft = msToTime(remaining);
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ لــقــد حــصــلــت عــلــى راتــبــك بــالــفــعــل*\n\n*⏰ الــوقــت الــمــتــبــقــي:* ${timeLeft}\n\n*❍↵ انــتــظــر حــتــى يــمــر الــوقــت*`
        }, { quoted: msg });
    }
    
    // حساب المكافآت العشوائية
    const diamonds = Math.floor(Math.random() * 30) + 5; // 5-35 ألماس
    const coins = Math.floor(Math.random() * 10) + 2; // 2-12 عملة
    const points = Math.floor(Math.random() * 4000) + 500; // 500-4500 نقطة
    
    // تحديث بيانات المستخدم
    user.diamonds = (user.diamonds || 0) + diamonds;
    user.coins = (user.coins || 0) + coins;
    user.points = (user.points || 0) + points;
    user.lastDaily = now;
    
    saveUsers(users);
    
    const result = `*‏❖══════ •『💰』• ══════❖*\n\n*❍↵ الــرّاتــب الــيــومــي*\n\n*▸ 💎 الألمــاس:* +${diamonds}\n*▸ 🪙 الــعــمــلات:* +${coins}\n*▸ ⭐ الــنــقــاط:* +${points}\n\n*❃━═━═✦•〘•📊•〙•✦═━═━❃*\n\n*▸ رصــيــد الألمــاس:* ${user.diamonds}\n*▸ رصــيــد الــعــمــلات:* ${user.coins}\n*▸ رصــيــد الــنــقــاط:* ${user.points}\n\n*‏❖══════ •『🎁』• ══════❖*\n> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
    
    await sock.sendMessage(chatId, { text: result }, { quoted: msg });
    
    // تفاعل
    await sock.sendMessage(chatId, {
        react: { text: '💰', key: msg.key }
    });
}

export default { NovaUltra, execute };