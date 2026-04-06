// ملف: plugins/المجموعة/حسبة.js

// تخزين نقاط التفاعل لكل عضو
const userPoints = new Map();

export const NovaUltra = {
    command: ["حسبة", "نقاط", "تفاعل", "stats"],
    description: "يعرض نقاط تفاعل الأعضاء في المجموعة",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: false
};

// نقاط التفاعل لكل نوع رسالة
const POINTS = {
    text: 1,
    image: 2,
    video: 3,
    audio: 2,
    sticker: 1,
    reply: 2,
    delete: -1
};

// ========== دالة تسجيل التفاعل (يتم استدعاؤها عند كل رسالة) ==========
export async function trackInteraction(sock, msg) {
    try {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const timestamp = Date.now();
        
        // تجاهل رسائل البوت نفسه والرسائل الخاصة
        if (msg.key.fromMe || !chatId?.includes("@g.us")) return;
        
        // تحديد نوع الرسالة ونقاطها
        let points = POINTS.text;
        
        if (msg.message?.imageMessage) {
            points = POINTS.image;
        } else if (msg.message?.videoMessage) {
            points = POINTS.video;
        } else if (msg.message?.audioMessage) {
            points = POINTS.audio;
        } else if (msg.message?.stickerMessage) {
            points = POINTS.sticker;
        }
        
        // التحقق إذا كان رد على رسالة
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            points += POINTS.reply;
        }
        
        // تخزين التفاعل
        const key = `${chatId}_${sender}`;
        if (!userPoints.has(key)) {
            userPoints.set(key, []);
        }
        
        const interactions = userPoints.get(key);
        interactions.push({ timestamp, points });
        
        // تنظيف التفاعلات القديمة جداً (أقدم من 30 يوم) لتوفير الذاكرة
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const filtered = interactions.filter(i => timestamp - i.timestamp < thirtyDays);
        userPoints.set(key, filtered);
        
    } catch (error) {
        console.error("❌ خطأ في تسجيل التفاعل:", error);
    }
}

// ========== دالة لجلب نقاط العضو خلال فترة زمنية ==========
function getUserPointsInPeriod(interactions, hours = null) {
    const now = Date.now();
    
    // إذا لم يتم تحديد ساعات، نجيب كل النقاط (منذ بداية التسجيل)
    if (hours === null) {
        const totalPoints = interactions.reduce((sum, i) => sum + i.points, 0);
        return {
            points: totalPoints,
            messagesCount: interactions.length
        };
    }
    
    // إذا تم تحديد ساعات، نجيب النقاط خلال الفترة
    const periodMs = hours * 60 * 60 * 1000;
    const filtered = interactions.filter(i => now - i.timestamp < periodMs);
    const totalPoints = filtered.reduce((sum, i) => sum + i.points, 0);
    
    return {
        points: totalPoints,
        messagesCount: filtered.length
    };
}

// ========== دالة الحصول على اسم العضو ==========
async function getMemberName(sock, chatId, jid) {
    try {
        const chat = await sock.groupMetadata(chatId);
        const member = chat.participants.find(p => p.id === jid);
        return member?.notifyName || member?.id.split('@')[0] || jid.split('@')[0];
    } catch {
        return jid.split('@')[0];
    }
}

export async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    
    try {
        // التحقق من المجموعة
        const chat = await sock.groupMetadata(chatId).catch(() => null);
        if (!chat) {
            return sock.sendMessage(chatId, { 
                text: "❌ هذا الأمر فقط للمجموعات" 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(chatId, {
            react: { text: "📊", key: msg.key }
        });
        
        // تحديد الفترة الزمنية
        let hours = null; // null = كل النقاط
        let periodText = "كل الوقت";
        
        if (args[0] && !isNaN(args[0])) {
            hours = parseInt(args[0]);
            if (hours > 168) hours = 168;
            if (hours < 1) hours = 1;
            
            if (hours === 24) periodText = "آخر 24 ساعة";
            else if (hours === 168) periodText = "آخر 7 أيام";
            else periodText = `آخر ${hours} ساعة`;
        }
        
        const participants = chat.participants;
        const pointsList = [];
        
        // حساب نقاط كل عضو
        for (const participant of participants) {
            const jid = participant.id;
            const key = `${chatId}_${jid}`;
            const interactions = userPoints.get(key) || [];
            const { points, messagesCount } = getUserPointsInPeriod(interactions, hours);
            
            if (points > 0 || messagesCount > 0) {
                const name = participant.notifyName || jid.split('@')[0];
                pointsList.push({
                    jid: jid,
                    name: name,
                    points: points,
                    messages: messagesCount
                });
            }
        }
        
        // ترتيب حسب النقاط (الأعلى أولاً)
        pointsList.sort((a, b) => b.points - a.points);
        
        // بناء الرسالة
        let messageText = `*📊 حسبة التفاعل في المجموعة*\n`;
        messageText += `*📅 الفترة:* ${periodText}\n`;
        messageText += `*👥 المشاركون:* ${pointsList.length} من ${participants.length}\n\n`;
        
        if (pointsList.length === 0) {
            messageText += `⚠️ لا يوجد تفاعل في هذه الفترة\n\n`;
        } else {
            messageText += `*🏆 ترتيب التفاعل:*\n\n`;
            
            for (let i = 0; i < Math.min(pointsList.length, 15); i++) {
                const member = pointsList[i];
                let medal = "";
                if (i === 0) medal = "🥇 ";
                else if (i === 1) medal = "🥈 ";
                else if (i === 2) medal = "🥉 ";
                else medal = `${i+1}. `;
                
                messageText += `${medal} @${member.jid.split('@')[0]}\n`;
                messageText += `   └ ⭐ ${member.points} نقطة | 💬 ${member.messages} رسالة\n\n`;
            }
        }
        
        // نقاط المستخدم نفسه
        const userKey = `${chatId}_${sender}`;
        const userInteractions = userPoints.get(userKey) || [];
        const userStats = getUserPointsInPeriod(userInteractions, hours);
        
        messageText += `*👤 نقاطك الشخصية:*\n`;
        messageText += `└ ⭐ ${userStats.points} نقطة | 💬 ${userStats.messagesCount} رسالة\n\n`;
        
        messageText += `*❖══════ •『 📊 』• ══════❖*\n`;
        messageText += `> .حسبة = كل الوقت\n`;
        messageText += `> .حسبة 24 = آخر 24 ساعة\n`;
        messageText += `> .حسبة 3 = آخر 3 ساعات\n`;
        messageText += `> .حسبة 168 = آخر 7 أيام\n`;
        messageText += `> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
        
        // استخراج المنشن
        const mentions = pointsList.slice(0, 15).map(m => m.jid);
        
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: mentions
        }, { quoted: msg });
        
        await sock.sendMessage(chatId, {
            react: { text: "✅", key: msg.key }
        });
        
        console.log(`✅ تم عرض حسبة التفاعل في ${chatId} - الفترة: ${periodText}`);
        
    } catch (err) {
        console.error("❌ خطأ:", err);
        await sock.sendMessage(chatId, { 
            text: "❌ حدث خطأ في حساب نقاط التفاعل"
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute, trackInteraction };