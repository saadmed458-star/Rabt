// plugins/الألعاب/جمال.js

export const NovaUltra = {
    command: "جمال",
    description: "يعرض نسبة جمال الشخص الممنشن",
    category: "ألعاب",
    elite: "off",
    group: true,
    prv: true,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    
    // الحصول على اسم الشخص المطلوب
    let targetName = "نفسك";
    let targetJid = null;
    
    // التحقق من وجود منشن
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (mentionedJid) {
        targetJid = mentionedJid;
        targetName = `@${targetJid.split('@')[0]}`;
    } else if (args.length > 0) {
        targetName = args.join(" ");
    } else {
        // إذا لم يكن هناك منشن ولا اسم، يستخدم المرسل نفسه
        const sender = msg.key.participant || msg.key.remoteJid;
        targetName = `@${sender.split('@')[0]}`;
        targetJid = sender;
    }
    
    // حساب نسبة عشوائية
    const percentage = Math.floor(Math.random() * 101);
    
    // تحديد الوصف حسب النسبة
    let description = "";
    if (percentage >= 90) {
        description = "✨ مــلــك/مــلــكــة الــجــمــال ✨";
    } else if (percentage >= 70) {
        description = "🌟 جــمــيــل/جــمــيــلــة جــداً 🌟";
    } else if (percentage >= 50) {
        description = "💫 جــمــيــل/جــمــيــلــة 💫";
    } else if (percentage >= 30) {
        description = "🌱 جــمــالــك مــحــتــاج تــطــويــر 🌱";
    } else {
        description = "🫢 لا تــحــزن، الــجــمــال الــحــقــيــقــي مــن الــداخــل 🫢";
    }
    
    const result = `*‏❖══════ •『✨』• ══════❖*\n\n*❍↵ نــســبــة الــجــمــال*\n\n*▸ الــشــخــص :* ${targetName}\n*▸ الــنــســبــة :* ${percentage}% / 100%\n\n*❍↵ ${description}*\n\n*‏❖══════ •『💐』• ══════❖*\n> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
    
    const mentions = targetJid ? [targetJid] : [];
    
    await sock.sendMessage(chatId, {
        text: result,
        mentions: mentions
    }, { quoted: msg });
    
    // تفاعل
    await sock.sendMessage(chatId, {
        react: { text: '✨', key: msg.key }
    });
}

export default { NovaUltra, execute };