// ملف: plugins/المجموعة/نشطين.js

// تخزين آخر تفاعل للأعضاء
const lastActivity = new Map();

export const NovaUltra = {
    command: ["نشطين", "متفاعلين", "متواجدين", "active"],
    description: "يعرض الأعضاء النشطين في المجموعة (الذين تفاعلوا مؤخراً)",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: false
};

// دالة لتسجيل نشاط الأعضاء (يتم استدعاؤها عند كل رسالة)
export async function trackActivity(sock, msg, text) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    
    // تجاهل رسائل البوت نفسه
    if (msg.key.fromMe) return;
    
    // تخزين وقت آخر نشاط
    lastActivity.set(`${chatId}_${sender}`, Date.now());
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
            react: { text: "🔄", key: msg.key }
        });
        
        const participants = chat.participants;
        const now = Date.now();
        
        // الفترات الزمنية (بالمللي ثانية)
        const timeRanges = [
            { name: "🟢 متصل الآن", time: 5 * 60 * 1000, limit: 5 },      // آخر 5 دقائق
            { name: "🟡 نشط خلال 10 د", time: 10 * 60 * 1000, limit: 10 }, // آخر 10 دقائق
            { name: "🟠 نشط خلال 30 د", time: 30 * 60 * 1000, limit: 30 }, // آخر 30 دقيقة
            { name: "🔴 نشط خلال ساعة", time: 60 * 60 * 1000, limit: 60 }   // آخر ساعة
        ];
        
        let activeNow = [];
        let active10min = [];
        let active30min = [];
        let active1hour = [];
        
        // فحص كل عضو
        for (const participant of participants) {
            const jid = participant.id;
            const name = participant.notifyName || jid.split('@')[0];
            const lastTime = lastActivity.get(`${chatId}_${jid}`);
            
            if (lastTime) {
                const diff = now - lastTime;
                
                if (diff <= timeRanges[0].time) {
                    activeNow.push({ jid, name, lastTime: diff });
                } else if (diff <= timeRanges[1].time) {
                    active10min.push({ jid, name, lastTime: diff });
                } else if (diff <= timeRanges[2].time) {
                    active30min.push({ jid, name, lastTime: diff });
                } else if (diff <= timeRanges[3].time) {
                    active1hour.push({ jid, name, lastTime: diff });
                }
            }
        }
        
        // بناء الرسالة
        let messageText = `*👥 الأعضاء النشطين في المجموعة*\n\n`;
        messageText += `*📊 الإحصائيات:*\n`;
        messageText += `└ 👥 إجمالي الأعضاء: ${participants.length}\n`;
        messageText += `└ 🟢 نشط خلال 5 دقائق: ${activeNow.length}\n`;
        messageText += `└ 🟡 نشط خلال 10 دقائق: ${active10min.length}\n`;
        messageText += `└ 🟠 نشط خلال 30 دقيقة: ${active30min.length}\n`;
        messageText += `└ 🔴 نشط خلال ساعة: ${active1hour.length}\n\n`;
        
        let mentions = [];
        
        // عرض النشطين حالياً
        if (activeNow.length > 0) {
            messageText += `*🟢 متصلون الآن (آخر 5 دقائق):*\n`;
            for (let i = 0; i < Math.min(activeNow.length, 20); i++) {
                const m = activeNow[i];
                const timeAgo = Math.floor(m.lastTime / 1000);
                messageText += `${i+1}. @${m.jid.split('@')[0]} (منذ ${timeAgo} ثانية)\n`;
                mentions.push(m.jid);
            }
            if (activeNow.length > 20) {
                messageText += `\n*و ${activeNow.length - 20} آخرين...*\n`;
            }
        } else {
            messageText += `*🟢 متصلون الآن:*\nلا يوجد أعضاء نشطون حالياً\n`;
        }
        
        // عرض النشطين خلال 10 دقائق (إذا كان العدد قليل)
        if (activeNow.length < 5 && active10min.length > 0) {
            messageText += `\n*🟡 نشط خلال 10 دقائق:*\n`;
            for (let i = 0; i < Math.min(active10min.length, 10); i++) {
                const m = active10min[i];
                const minutesAgo = Math.floor(m.lastTime / 60000);
                messageText += `${i+1}. @${m.jid.split('@')[0]} (منذ ${minutesAgo} دقيقة)\n`;
                mentions.push(m.jid);
            }
        }
        
        messageText += `\n*❖══════ •『 📱 』• ══════❖*\n> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
        
        // إرسال النتيجة مع منشن
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: mentions.slice(0, 50)
        }, { quoted: msg });
        
        await sock.sendMessage(chatId, {
            react: { text: "✅", key: msg.key }
        });
        
        console.log(`✅ تم عرض النشطين في ${chatId}`);
        
    } catch (err) {
        console.error("❌ خطأ:", err);
        await sock.sendMessage(chatId, { 
            text: "❌ حدث خطأ في جلب الأعضاء النشطين"
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute, trackActivity };