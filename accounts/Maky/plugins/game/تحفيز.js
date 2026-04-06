// plugins/المجموعات/تحفيز.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ تفاعلات الأعضاء
const statsFile = path.join(__dirname, "../nova/data/stats.json");

const dataDir = path.join(__dirname, "../nova/data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(statsFile)) fs.writeFileSync(statsFile, JSON.stringify({}));

function loadStats() {
    try {
        return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveStats(data) {
    fs.writeFileSync(statsFile, JSON.stringify(data, null, 2), 'utf8');
}

// دالة لزيادة تفاعل العضو
async function incrementInteraction(sock, groupId, userId) {
    const stats = loadStats();
    if (!stats[groupId]) stats[groupId] = {};
    if (!stats[groupId][userId]) stats[groupId][userId] = { count: 0, lastMsg: 0 };
    
    stats[groupId][userId].count++;
    stats[groupId][userId].lastMsg = Date.now();
    saveStats(stats);
}

// رسائل تحفيزية عشوائية
const motivationalMessages = [
    "🌟 ياااااااااااااااااااااااااه!!! وينكم؟ المجموعة نايمة! 🌙",
    "🔥 قوموا قوموا! التفاعل نازل تحت الصفر! 📉",
    "💪 شنو هالسكون؟! حنا هنا عشان نتفاعل مو عشان نسكت!",
    "🎉 وينكم يا جماعة؟! المجموعة تحتاج حماس! ⚡",
    "👀 في حد حي هنا؟ ولا كلهم ناموا؟!",
    "🗣️ الموضوع ما يمشي بدون تفاعل! شاركونا آرائكم!",
    "💬 السكون قاتل! اكتبوا أي شيء، حتى إيموجي!",
    "🚀 حماس حماس! وين الحماس؟!",
    "🎭 المجموعة زي المقبرة! أحد عنده صوت؟!",
    "📢 تذكير: التفاعل يزيد الأجر والمحبة! انشروا الطاقة الإيجابية!",
    "🤔 في أسئلة؟ في اقتراحات؟ شاركونا!",
    "⭐ كل تفاعل تحسبه يسجل لك نقطة في سجل الشرف!",
    "🎯 الهدف اليوم: 100 رسالة! وينكم؟!",
    "💡 شاركنا رأيك في أي موضوع!",
    "🔄 المجموعة تحتاج حركة! ابدأ أنت!"
];

function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// رسائل للعضو الأكثر تفاعلاً
function getTopMemberMessage(name, count) {
    const topMessages = [
        `🏆 مبروك @${name}! أنت العضو الأكثر تفاعلاً اليوم بـ ${count} رسالة! 🎉`,
        `👑 الملك/الملكة @${name} تصدر قائمة التفاعل بـ ${count} رسالة! 🌟`,
        `💪 @${name} أسطورة التفاعل اليوم بـ ${count} رسالة! استمر! 🔥`,
        `🎊 تكريم خاص للعضو المتفاعل @${name} بـ ${count} رسالة! 👏`,
        `✨ @${name} نجم اليوم بـ ${count} تفاعل! يااااه! ⭐`
    ];
    return topMessages[Math.floor(Math.random() * topMessages.length)];
}

export const NovaUltra = {
    command: "تحفيز",
    description: "تحفيز الأعضاء على التفاعل",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const action = args[0]?.toLowerCase();
    
    // عرض الإحصائيات
    if (action === "احصائيات" || action === "stats") {
        const stats = loadStats();
        const groupStats = stats[chatId] || {};
        
        // ترتيب الأعضاء حسب التفاعل
        const sorted = Object.entries(groupStats)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
        
        if (sorted.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `*‏❖══════ •『📊』• ══════❖*\n\n*❍↵ لا تــوجــد إحــصــائــيــات بــعــد*\n*❍↵ حــافــز الأعــضــاء لــلــتــفــاعــل*\n\n*‏❖══════ •『💐』• ══════❖*`
            }, { quoted: msg });
        }
        
        let statsText = `*‏❖══════ •『📊』• ══════❖*\n\n*❍↵ أعــلــى 5 أعــضــاء تــفــاعــلاً*\n\n`;
        
        for (let i = 0; i < sorted.length; i++) {
            const [userId, data] = sorted[i];
            const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : '📌'));
            statsText += `*${medal}* @${userId.split('@')[0]} : ${data.count} رسالة\n`;
        }
        
        statsText += `\n*‏❖══════ •『💐』• ══════❖*`;
        
        const mentions = sorted.map(s => s[0]);
        await sock.sendMessage(chatId, { text: statsText, mentions }, { quoted: msg });
        return;
    }
    
    // تحفيز المجموعة
    const randomMsg = getRandomMessage();
    const messageToSend = `*‏❖══════ •『🔥』• ══════❖*\n\n*❍↵ ${randomMsg}*\n\n*❍↵ اكــتــب .تحفيز احصائيات لــرؤيــة الــتــرتيــب*\n\n*‏❖══════ •『💐』• ══════❖*`;
    
    await sock.sendMessage(chatId, { text: messageToSend }, { quoted: msg });
    await sock.sendMessage(chatId, { react: { text: '🔥', key: msg.key } });
    
    // تحديث تفاعل المستخدم الذي استخدم الأمر
    const sender = msg.key.participant || msg.key.remoteJid;
    await incrementInteraction(sock, chatId, sender);
}

// مستمع لزيادة التفاعل عند إرسال رسائل
export async function trackMessages(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return;
    if (msg.key.fromMe) return;
    
    const sender = msg.key.participant || msg.key.remoteJid;
    await incrementInteraction(sock, chatId, sender);
    
    // كل 50 رسالة في المجموعة، نرسل رسالة تحفيزية
    const stats = loadStats();
    const groupStats = stats[chatId] || {};
    const totalMessages = Object.values(groupStats).reduce((sum, user) => sum + user.count, 0);
    
    if (totalMessages > 0 && totalMessages % 50 === 0 && totalMessages !== stats[chatId]?.lastNotified) {
        stats[chatId] = stats[chatId] || {};
        stats[chatId].lastNotified = totalMessages;
        saveStats(stats);
        
        // إرسال رسالة تحفيزية تلقائية
        const topUser = Object.entries(groupStats).sort((a, b) => b[1].count - a[1].count)[0];
        if (topUser) {
            const topMsg = getTopMemberMessage(topUser[0].split('@')[0], topUser[1].count);
            await sock.sendMessage(chatId, {
                text: `*‏❖══════ •『🏆』• ══════❖*\n\n*❍↵ ${topMsg}*\n\n*‏❖══════ •『💐』• ══════❖*`,
                mentions: [topUser[0]]
            });
        }
    }
}

export default { NovaUltra, execute, trackMessages };