// plugins/بروفايل.js
import { jidDecode } from '@whiskeysockets/baileys';

export const NovaUltra = {
    command: ["بروفايل"],
    description: "عرض صورة الملف الشخصي لأي شخص",
    category: "بروفايل",
    elite: "off",
    group: true,
    prv: true,
    lock: "off",
    nova: "on"
};

async function execute({ sock, msg, args }) {
    try {
        const chatId = msg.key.remoteJid;
        let targetJid = null;
        
        // الحالة 1: الرد على رسالة شخص
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (contextInfo?.participant) {
            targetJid = contextInfo.participant;
        }
        
        // الحالة 2: منشن شخص
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!targetJid && mentionedJid && mentionedJid.length > 0) {
            targetJid = mentionedJid[0];
        }
        
        // الحالة 3: كتابة رقم بعد الأمر
        if (!targetJid && args && args.length > 0) {
            let number = args[0].replace(/\D/g, '');
            if (number.length > 6) {
                targetJid = number + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, {
                text: '*╻👤╹↵ من فضلك رد على رسالة الشخص اللي عاوز تشوف بروفايله، أو قم بمنشنه، أو اكتب الرقم بعد الأمر.*'
            }, { quoted: msg });
        }

        // محاولة جلب صورة البروفايل
        let ppUrl = null;
        try {
            ppUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch (err) {
            // إذا فشل جلب صورة الشخص، جرب جلب صورة المجموعة (إذا كان في مجموعة)
            if (chatId.endsWith('@g.us')) {
                try {
                    ppUrl = await sock.profilePictureUrl(chatId, 'image');
                } catch (e) {}
            }
        }

        if (!ppUrl) {
            return await sock.sendMessage(chatId, {
                text: '*_~╻❌╹↵ لا يوجد صورة بروفايل لهذا الشخص أو غير مسموح بالوصول إليها.~_*'
            }, { quoted: msg });
        }

        // فك تشفير المعرف للحصول على الرقم
        const decodedJid = jidDecode(targetJid)?.user || targetJid.split('@')[0];
        
        await sock.sendMessage(chatId, {
            image: { url: ppUrl },
            caption: `*╻👀╹↵ تـم سـرقـة بـروفـايـلـك هـهـهـهـهـه ╻😂╹↵~_*\n\n*_~ @${decodedJid} *`,
            mentions: [targetJid]
        }, { quoted: msg });

        // تفاعل ✅
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: msg.key }
        });

    } catch (err) {
        console.error('❌ خطأ في أمر بروفايل:', err);
        await sock.sendMessage(msg.key.remoteJid, {
            text: '*╻⚠️╹↵ حصل خطأ أثناء محاولة جلب صورة البروفايل.*'
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute };