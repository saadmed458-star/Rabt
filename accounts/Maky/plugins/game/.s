// plugins/النظام/s.js

export const NovaUltra = {
    command: "s",
    description: "اختبار إرسال رسائل (للمالك فقط)",
    elite: "on",
    group: true,
    prv: false,
    lock: "off"
};

// رسائل ساخرة
const sarcasticMessages = [
    "🫦 يا عيب الشوم! تجيبو أعضائنا؟! أستحوا على وجوهكم!",
    "😂 مافي حل غير تغير رابطكم! كل ما تجيبو عضو نجي نسوي سبام!",
    "🔥 يا جماعة الخير، شو هالاستراتيجية الضعيفة؟ سرقة أعضاء؟!",
    "💀 رابطكم مكشوف! غيروه ولا راح نوقف سبام!",
    "🤡 عيب! تجيبو ناس من قروبنا؟! أنتم تستاهلو كل سبام!",
    "👀 شفناكم! كل عضو تجيبوه راح نجي هنا ونخربها!",
    "⚡ غيرو الرابط أو استعدو للسبام اليومي!",
    "🫵 أنتو اللي بدأتوا بالسرقة، احنا بس نرد التحية!",
    "📢 تنبيه: رابطكم عندنا، غيروه لو تبيو الراحة!",
    "💢 يا حرام! سرقة أعضاء؟! تراها مو حلال!",
    "🎯 هدفنا: كل ما تجيبو عضو نرسل 10 رسائل!",
    "🔄 الحل الوحيد: تغيرو الرابط! واعتذروا!",
    "😈 سبام سبام سبام! لين ما تطفشو وتغيرو الرابط!",
    "🚨 تحذير أخير: غيرو الرابط أو استعدو للمزيد!",
    "💔 كنتو تظنو انكم فاهمين؟ غلطانين!"
];

// رسائل الوداع
const goodbyeMessages = [
    "🏃‍♂️ رحت غيرو الرابط! مع السلامة!",
    "🚪 طلعنا! غيرو الرابط وريحو راسكم!",
    "💨 باي باي! غيرو الرابط قبل لا نرجع!",
    "👋 شوفكم بعدين! غيرو الرابط لو تبيو الراحة!",
    "🕊️ سلام! غيرو الرابط وخلاص ننسى الموضوع!"
];

function getRandomMessage(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function execute({ sock, msg, args, sender }) {
    const chatId = msg.key.remoteJid;
    
    // التحقق من أن المستخدم من النخبة (المالك)
    const ownerNumber = "22230471912"; // ضع رقمك هنا
    
    if (sender.pn !== ownerNumber + "@s.whatsapp.net") {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『🛡️』• ══════❖*\n\n*❍↵ هــذا الأمــر مــخــصــص لــلــمــالــك فــقــط*\n\n*❍↵ لــديــك صــلاحــيــات؟ تــواصــل مــع الــمــالــك*\n\n*‏❖══════ •『💐』• ══════❖*`
        }, { quoted: msg });
    }
    
    // عدد الرسائل
    let count = parseInt(args[0]);
    if (isNaN(count) || count < 1) count = 10;
    if (count > 30) count = 30; // حد أقصى 30
    
    // رسالة التأكيد
    const confirmMsg = await sock.sendMessage(chatId, {
        text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ ســيــتــم إرســال ${count} رســالــة*\n*❍↵ ثــم ســيــغــادر الــبــوت*\n\n*❍↵ اكــتــب "تــأكــيــد" لــلــبــدء*\n*❍↵ اكــتــب "الــغــاء" لــلــإلــغــاء*\n\n*‏❖══════ •『💀』• ══════❖*`
    });
    
    let active = true;
    let timeoutId;
    
    const listener = async (event) => {
        if (!active) return;
        
        const messages = event.messages;
        for (const m of messages) {
            if (m.key.remoteJid !== chatId) continue;
            if (m.key.fromMe) continue;
            
            const text = m.message?.conversation?.toLowerCase() || 
                         m.message?.extendedTextMessage?.text?.toLowerCase() || '';
            
            if (text === "تأكيد" || text === "تاكيد") {
                active = false;
                clearTimeout(timeoutId);
                sock.ev.off("messages.upsert", listener);
                
                // إرسال الرسائل الساخرة
                for (let i = 1; i <= count; i++) {
                    const randomMsg = getRandomMessage(sarcasticMessages);
                    await sock.sendMessage(chatId, {
                        text: `*‏❖══════ •『💢』• ══════❖*\n\n*❍↵ ${randomMsg}*\n\n*📌 رســالــة ${i}/${count}*\n\n*‏❖══════ •『💀』• ══════❖*`
                    });
                    await new Promise(r => setTimeout(r, 800));
                }
                
                // رسالة الوداع الساخرة
                const goodbyeMsg = getRandomMessage(goodbyeMessages);
                await sock.sendMessage(chatId, {
                    text: `*‏❖══════ •『🚪』• ══════❖*\n\n*❍↵ ${goodbyeMsg}*\n\n*❍↵ نــصــيــحــة: غــيــرو الــرابــط*\n\n*‏❖══════ •『💐』• ══════❖*`
                });
                
                // انتظار ثانيتين ثم المغادرة
                await new Promise(r => setTimeout(r, 2000));
                
                // مغادرة المجموعة
                const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                await sock.groupParticipantsUpdate(chatId, [botJid], 'remove');
                
            } else if (text === "الغاء" || text === "إلغاء") {
                active = false;
                clearTimeout(timeoutId);
                sock.ev.off("messages.upsert", listener);
                await sock.sendMessage(chatId, {
                    text: `*‏❖══════ •『🛑』• ══════❖*\n\n*❍↵ تــم إلــغــاء الــعــمــلــيــة*\n\n*❍↵ الحل الوحيد غيرو الرابط 🫦*`
                }, { quoted: m });
            }
        }
    };
    
    sock.ev.on("messages.upsert", listener);
    
    // مهلة 30 ثانية
    timeoutId = setTimeout(async () => {
        if (active) {
            active = false;
            sock.ev.off("messages.upsert", listener);
            await sock.sendMessage(chatId, {
                text: `*‏❖══════ •『⏰』• ══════❖*\n\n*❍↵ انــتــهــت مــهــلــة الــرد*\n\n*❍↵ مافي حل غير تغير الرابط 🫦*`
            });
        }
    }, 30000);
}

export default { NovaUltra, execute };