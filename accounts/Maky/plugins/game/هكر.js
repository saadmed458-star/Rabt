// plugins/تهكير.js
import { jidDecode } from '@whiskeysockets/baileys';

const decode = (jid) => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

export const NovaUltra = {
    command: "تهكير",
    description: "تهكير وهمي لعضو محدد (مزحة)",
    usage: ".تهكير @عضو أو بالرد أو في الخاص",
    category: "مزحة",
    elite: "off",
    group: true,
    prv: true,
    lock: "off"
};

async function execute({ sock, msg }) {
    try {
        const groupJid = msg.key.remoteJid;
        const isGroup = groupJid.endsWith('@g.us');
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const isPrivate = !isGroup;

        const targetJid = mentioned || quoted || (isPrivate ? msg.key.remoteJid : null);

        if (!targetJid) {
            return await sock.sendMessage(groupJid, {
                text: '*╻❗╹↵ منشن شخص أو رد عليه لاستخدام هذا الأمر داخل المجموعة.*'
            }, { quoted: msg });
        }

        const targetID = decode(targetJid).split('@')[0];

        const steps = [
            "*╻📷╹↵ سحب الصور الخاصة...*",
            "*╻📂╹↵ تحميل ملفات المحادثات السرية...*",
            "*╻🎙️╹↵ تسجيل من المايكروفون...*",
            "*╻📍╹↵ تحديد الموقع الجغرافي...*",
            "*╻🔐╹↵ استخراج كلمات السر...*",
            "*╻💬╹↵ الدخول إلى حساب واتساب...*",
            "*╻🛡️╹↵ سرقة التوكنات من التطبيقات...*",
            "*╻📡╹↵ إرسال البيانات إلى السريفر...*"
        ];

        const progressBars = [
            "*╻▰▱▱▱▱▱▱▱▱▱ 10%╹↵*",
            "*╻▰▰▱▱▱▱▱▱▱▱ 20%╹↵*",
            "*╻▰▰▰▱▱▱▱▱▱▱ 30%╹↵*",
            "*╻▰▰▰▰▱▱▱▱▱▱ 40%╹↵*",
            "*╻▰▰▰▰▰▱▱▱▱▱ 50%╹↵*",
            "*╻▰▰▰▰▰▰▱▱▱▱ 60%╹↵*",
            "*╻▰▰▰▰▰▰▰▱▱▱ 70%╹↵*",
            "*╻▰▰▰▰▰▰▰▰▱▱ 80%╹↵*",
            "*╻▰▰▰▰▰▰▰▰▰▱ 90%╹↵*",
            "*╻▰▰▰▰▰▰▰▰▰▰ 100%╹↵*"
        ];

        // إرسال أول رسالة
        let sent = await sock.sendMessage(groupJid, {
            text: `*╻🧠╹↵ جاري اختراق : ${targetID}...*\n${steps[0]}\n${progressBars[0]}`
        }, { quoted: msg });

        // تعديل الرسالة تدريجيًا
        for (let i = 1; i < steps.length; i++) {
            await new Promise(res => setTimeout(res, 1200));
            await sock.sendMessage(groupJid, {
                edit: sent.key,
                text: `*╻🧠╹↵ جاري اختراق : ${targetID}...*\n${steps[i]}\n${progressBars[i]}`
            });
        }

        // الرسالة الختامية
        await new Promise(res => setTimeout(res, 1500));
        await sock.sendMessage(groupJid, {
            edit: sent.key,
            text: `*╻✅╹↵ تم اختراق ${targetID} بنجاح!*\n\n*╻👑╹↵ معلوماتك عند لاك.*\n*╻📨╹↵ روح خدها قبل ما نفضحك ╻😈╹↵*\n${progressBars[9]}`
        });

        // تفاعل
        await sock.sendMessage(groupJid, {
            react: { text: '😈', key: msg.key }
        });

    } catch (error) {
        console.error('❌ خطأ في أمر تهكير:', error);
        await sock.sendMessage(msg.key.remoteJid, {
            text: `*╻❌╹↵ حصل خطأ أثناء التنفيذ:*\n\n${error.message || error.toString()}`,
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute };