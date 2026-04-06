// plugins/النظام/غادر.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jidDecode } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة رقم المالك من ملف config
function getOwnerNumber() {
    try {
        const configPath = path.join(process.cwd(), 'nova', 'config.js');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const match = configContent.match(/owner:\s*['"]([0-9]+)['"]/);
        if (match) {
            return match[1];
        }
    } catch (err) {
        console.error("خطأ في قراءة رقم المالك:", err);
    }
    return "22230471912";
}

// دالة لاستخراج الرقم من الـ JID
function extractNumber(jid) {
    if (!jid) return null;
    // إذا كان LID، نحاول استخراج الرقم من الـ twice
    if (jid.includes('@lid')) {
        // محاولة جلب الرقم من elite-pro.json
        try {
            const elitePath = path.join(process.cwd(), 'handlers', 'elite-pro.json');
            if (fs.existsSync(elitePath)) {
                const eliteData = JSON.parse(fs.readFileSync(elitePath, 'utf8'));
                if (eliteData.twice && eliteData.twice[jid]) {
                    const jidNumber = eliteData.twice[jid];
                    return jidNumber.split('@')[0];
                }
            }
        } catch (err) {}
        return null;
    }
    // إذا كان JID عادي
    return jid.split('@')[0];
}

// دالة لاستخراج رقم المرسل الحقيقي
function getSenderNumber(msg, sock) {
    // محاولة من المشارك
    let sender = msg.key.participant || msg.key.remoteJid;
    
    // إذا كان LID، نحاول جلب الرقم
    if (sender && sender.includes('@lid')) {
        const extracted = extractNumber(sender);
        if (extracted) return extracted;
    }
    
    // محاولة من pushName أو غيره
    if (msg.pushName) {
        // هذا اسم وليس رقم، نبحث عن الرقم من خلال الـ JID
        if (msg.key.participant && !msg.key.participant.includes('@lid')) {
            return msg.key.participant.split('@')[0];
        }
        if (msg.key.remoteJid && !msg.key.remoteJid.includes('@lid')) {
            return msg.key.remoteJid.split('@')[0];
        }
    }
    
    // المحاولة الأخيرة: استخدام رقم المالك نفسه
    return getOwnerNumber();
}

export const NovaUltra = {
    command: "غادر",
    description: "البوت يغادر المجموعة (للمالك فقط)",
    elite: "off",
    group: true,
    prv: false,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    
    // استخراج رقم المرسل الحقيقي
    const senderNumber = getSenderNumber(msg, sock);
    const ownerNumber = getOwnerNumber();
    
    console.log(`🔍 التحقق:`);
    console.log(`📌 رقم المرسل: ${senderNumber}`);
    console.log(`📌 رقم المالك: ${ownerNumber}`);
    console.log(`📌 المسار: ${msg.key.participant || msg.key.remoteJid}`);
    
    // التحقق من أن المرسل هو المالك
    if (senderNumber !== ownerNumber) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『🛡️』• ══════❖*\n\n*❍↵ هــذا الأمــر مــخــصــص لــلــمــالــك فــقــط.*\n\n*📌 رقــم الــمــالــك:* ${ownerNumber}\n*📌 رقــمــك:* ${senderNumber}\n\n*⚠️ إذا كنت المالك، تأكد من إعداد رقمك في ملف config.js*`
        }, { quoted: msg });
    }
    
    // الحصول على سبب المغادرة (اختياري)
    const reason = args.join(' ') || "لا يوجد سبب محدد";
    
    // إرسال رسالة الوداع قبل المغادرة
    await sock.sendMessage(chatId, {
        text: `*‏❖══════ •『🚪』• ══════❖*\n\n*❍↵ ســيــتــم مــغــادرة الــبــوت مــن الــمــجــمــوعــة*\n\n*❍↵ الــســبــب :* ${reason}\n\n*❍↵ وداعاً، كــان ســعــيــداً بــكــم 🌹*\n\n*‏❖══════ •『💐』• ══════❖*`
    }, { quoted: msg });
    
    // انتظار ثانيتين قبل المغادرة
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // مغادرة المجموعة
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(chatId, [botJid], 'remove');
}

export default { NovaUltra, execute };