// ملف: plugins/الألعاب/تنمر.js

import { jidDecode } from "@whiskeysockets/baileys";

export const NovaUltra = {
    command: ["تنمر", ],
    description: "يتنمر على عضو في المجموعة (للمزح)",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

function decode(jid) {
    return (jidDecode(jid)?.user || jid.split("@")[0]) + "@s.whatsapp.net";
}

// ========== قائمة جمل التنمر القديمة القوية ==========
const bullyJokes = [
    // تنمر على الذكاء
    "🧠 @{name} عقلك يقول لك سلام عليكم",
    "🤔 @{name} لو كان التفكير فلوس كنت مفلس",
    "💭 @{name} عندك مساحة فارغة في المخ",
    "📚 @{name} الدراسة نادتك بس انت هربت",
    "🎓 @{name} شهادتك؟ شهادة حسن سير وسلوك؟",
    "🧠 @{name} مخك يبي له صيانة",
    "🔋 @{name} طاقة عقلك 1%",
    "⚡ @{name} وش ذا الغباء؟",
    "💡 @{name} الفكرة عندك نادرة",
    "🎓 @{name} انت حمار مدرسة",
    
    // تنمر على الشكل
    "👀 @{name} وش ذا الشكل؟ قوم نام",
    "🪞 @{name} المراية كسرت من شكلك",
    "😬 @{name} وش ذا الوجه؟ خوفتني",
    "👽 @{name} من اي كوكب جيت؟",
    "🦧 @{name} جدك قرد ولا انسان؟",
    "😾 @{name} وش ذا الوجه اللي يخوف",
    "🤢 @{name} شكلتنا وضيعتنا",
    "🤮 @{name} شكلك يغث",
    "💀 @{name} وجهك وجه ميت",
    "👹 @{name} وش ذا الوجه المرعب",
    
    // تنمر على الكلام
    "🗣️ @{name} لسانك طوله 10 متر",
    "🔇 @{name} لو تسكت يكون افضل لك",
    "💬 @{name} كلامك كله فاضي",
    "📢 @{name} صوتك يوجع الراس",
    "🤐 @{name} اخرس تكفى",
    "🎤 @{name} سوالفك قديمة",
    "📻 @{name} كلامك مكرر",
    "🔁 @{name} انت نسخة مكررة",
    "🔄 @{name} اشتغل على نفسك",
    
    // تنمر على الأهل
    "👨‍👩‍👧 @{name} اهلك مستحيين منك",
    "🏠 @{name} اهلك طردوك من البيت",
    "👪 @{name} اهلك قالو ما نعرفك",
    "🤱 @{name} يوم ولدوك ضحكت الدنيا",
    "🍼 @{name} شكلك لسه ترضع",
    "👨 @{name} ابوك نادم يوم جابك",
    "👩 @{name} امك تعبانة فيك",
    "👴 @{name} جدك يتمنى موتك",
    "👵 @{name} جدتك تدعي عليك",
    "👶 @{name} ليه ما سقطوا يوم طلعوك",
    
    // تنمر على المكانة
    "💰 @{name} فلوسك؟ فلوس المصروف",
    "🏎️ @{name} سيارتك؟ دراجة هوائية",
    "🏠 @{name} بيتكم؟ خيمة بالبر",
    "📱 @{name} جوالك؟ نوكيا 3310",
    "👔 @{name} لبسك؟ من سوق الجمعة",
    "👕 @{name} لبسك من بالوعة",
    "👖 @{name} بنطلونك مرقع",
    "👟 @{name} حذائك مقطوع",
    "🧦 @{name} شرابك ريحته قوية",
    "🧢 @{name} قبعتك شكلك زبال",
    
    // تنمر ثقيل
    "🐷 @{name} شكلك خنزير ولا انسان؟",
    "🐸 @{name} وش ذا المنظر المقرف",
    "🪳 @{name} صرصور داركم",
    "🐀 @{name} فار المزرعة انت",
    "🦟 @{name} مزعج زي البعوض",
    "🐖 @{name} خنزير ولا انسان؟",
    "🐕 @{name} انت كلب حراسة",
    "🐒 @{name} قرد من الغابة",
    "🦧 @{name} جدك قرد",
    "🍌 @{name} اكل موز ولا مانع",
    
    // تنمر على الأسلوب
    "🎭 @{name} تمثلك زفت",
    "🎪 @{name} انت فضيحة متنقلة",
    "📉 @{name} مستواك في الحضيض",
    "🗑️ @{name} انت زبالة المجموعة",
    "🧹 @{name} المكان يبي ينظف منك",
    "🤡 @{name} انت المهرج الرسمي للمجموعة",
    
    // تنمر على العلاقات
    "💔 @{name} محد يحبك",
    "👥 @{name} مالك اصحاب",
    "🚫 @{name} الكل يكرهك",
    "😭 @{name} ليش انت موجود؟",
    "👋 @{name} ارحل محد يبيك",
    "💑 @{name} حبيبتك؟ خيالك",
    "💍 @{name} بتتزوج؟ استنى كثير",
    "💘 @{name} الحب ما يعرفك",
    
    // تنمر على المستقبل
    "📉 @{name} مستقبلك زفت",
    "🏚️ @{name} بتقعد تحت الكبري",
    "🍞 @{name} بتاكل عيش بالملح",
    "💼 @{name} شغلتك؟ تنظيف حمامات",
    "🚮 @{name} نهايتك زبال",
    "⚰️ @{name} النعش جاي ياخذك",
    "🪦 @{name} القبر ناداك",
    "👻 @{name} انت شبح ومحد شافك",
    "🧟 @{name} انت زومبي من الزبالة",
    
    // تنمر على السرعة
    "🐌 @{name} ردك بطيء زي الحلزون",
    "🐢 @{name} اسرع شوي يا سلحفاة",
    "🦥 @{name} انت كسلان ولا ميت؟",
    "🐇 @{name} وين سرعتك المعتادة؟",
    
    // تنمر نهائي
    "🏆 @{name} انت فاشل رقم 1",
    "🥇 @{name} ذهبية الفشل الكبير",
    "🎖️ @{name} وسام اسوء انسان",
    "📜 @{name} شهادة فشل معتمدة",
    "🔞 @{name} لا يصلح للاستخدام البشري",
    "💀 @{name} ليش انت عايش؟",
];

export async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    try {
        // التحقق من أن الأمر في مجموعة
        const chat = await sock.groupMetadata(chatId).catch(() => null);
        if (!chat) {
            return sock.sendMessage(chatId, { 
                text: "❌ هذا الأمر فقط للمجموعات" 
            }, { quoted: msg });
        }

        let targetUser = null;
        let targetName = "";
        let targetNumber = "";

        // طريقة 1: الرد على رسالة العضو
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = msg.message.extendedTextMessage.contextInfo;
            targetUser = quoted.participant || quoted.remoteJid;
            targetNumber = targetUser?.split('@')[0] || "";
            targetName = targetNumber;
        }
        
        // طريقة 2: استخدام منشن
        else if (args[0] && args[0].startsWith("@")) {
            targetNumber = args[0].replace("@", "");
            targetUser = targetNumber + "@s.whatsapp.net";
            targetName = targetNumber;
        }
        
        // طريقة 3: كتابة الرقم مباشرة
        else if (args[0] && !isNaN(args[0])) {
            targetNumber = args[0];
            targetUser = targetNumber + "@s.whatsapp.net";
            targetName = targetNumber;
        }

        // إذا لم يتم تحديد عضو
        if (!targetUser) {
            return sock.sendMessage(chatId, { 
                text: "📌 *كيف أتنمر على عضو؟*\n\n• رد على رسالته ثم اكتب `.تنمر`\n• اكتب `.تنمر @الرقم`\n• اكتب `.تنمر 9665xxxxxxx`"
            }, { quoted: msg });
        }

        // منع التنمر على البوت نفسه
        const botNumber = msg.key.remoteJid?.split('@')[0] || "";
        if (targetNumber === botNumber) {
            return sock.sendMessage(chatId, { 
                text: "🤖 لا يمكنك التنمر علي، أنا روبوت 😝" 
            }, { quoted: msg });
        }

        // اختيار جملة عشوائية
        const randomJoke = bullyJokes[Math.floor(Math.random() * bullyJokes.length)];
        const finalMessage = randomJoke.replace("{name}", targetName);

        // تفاعل قبل الإرسال
        await sock.sendMessage(chatId, {
            react: { text: "👊", key: msg.key }
        });

        // إرسال التنمر مع منشن
        await sock.sendMessage(chatId, {
            text: finalMessage,
            mentions: [targetUser]
        });

        console.log(`✅ تنمر على ${targetNumber} في ${chatId}`);

    } catch (err) {
        console.error("❌ خطأ في أمر التنمر:", err);
        await sock.sendMessage(chatId, { 
            text: "❌ حدث خطأ في أمر التنمر" 
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute };