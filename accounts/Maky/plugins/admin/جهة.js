// plugins/النظام/اضافة.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanNumber(number) {
    let clean = number.trim();
    clean = clean.replace(/^\*\s*/, '');
    clean = clean.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+') && /^\d+$/.test(clean)) {
        clean = '+' + clean;
    }
    return clean;
}

// دالة للتحقق من وجود العضو في المجموعة
async function isMemberInGroup(sock, groupId, jid) {
    try {
        const groupMeta = await sock.groupMetadata(groupId);
        return groupMeta.participants.some(p => p.id === jid);
    } catch (err) {
        console.error("خطأ في التحقق من العضوية:", err);
        return false;
    }
}

export const NovaUltra = {
    command: "اضافة",
    description: "إضافة رقم واحد إلى المجموعة",
    elite: "on",
    group: true,
    prv: false,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    
    // التحقق من وجود رقم
    if (args.length === 0) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『📇』• ══════❖*\n\n*❍↵ طــريــقــة الاســتــخــدام:*\n\n*▸ .اضافة [الرقم]*\n\n*مثال:*\n\`.اضافة +20 10 12345678\`\n\n*⚠️ يــضــاف رقــم واحــد فــقــط*\n\n*‏❖══════ •『💐』• ══════❖*`
        }, { quoted: msg });
    }
    
    // تنظيف الرقم
    let number = args.join(" ");
    number = cleanNumber(number);
    
    if (!number || number.length < 8) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ الــرقــم غــيــر صــالــح*\n*❍↵ تــأكــد مــن صــيــغــة الــرقــم*\n\n*مثال:* +20 10 12345678\n\n*‏❖══════ •『💐』• ══════❖*`
        }, { quoted: msg });
    }
    
    // تفاعل انتظار
    await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
    });
    
    const jid = number.includes('@') ? number : number + '@s.whatsapp.net';
    
    // التحقق أولاً: هل العضو موجود بالفعل؟
    const alreadyMember = await isMemberInGroup(sock, chatId, jid);
    
    if (alreadyMember) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ الــرقــم مــوجــود بــالــفــعــل*\n\n*▸ ${number}*\n\n*‏❖══════ •『💐』• ══════❖*`
        }, { quoted: msg });
    }
    
    // إضافة الرقم
    try {
        console.log(`🔄 محاولة إضافة: ${jid}`);
        
        const result = await sock.groupParticipantsUpdate(chatId, [jid], 'add');
        
        console.log("📊 نتيجة الإضافة:", JSON.stringify(result, null, 2));
        
        // انتظار قليلاً للتأكد
        await new Promise(r => setTimeout(r, 2000));
        
        // التحقق بعد الإضافة: هل تمت الإضافة فعلاً؟
        const isAdded = await isMemberInGroup(sock, chatId, jid);
        
        if (isAdded) {
            await sock.sendMessage(chatId, {
                text: `*‏❖══════ •『✅』• ══════❖*\n\n*❍↵ تــم إضــافــة الــرقــم*\n\n*▸ ${number}*\n\n*‏❖══════ •『💐』• ══════❖*`
            }, { quoted: msg });
            
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: msg.key }
            });
        } else {
            // التحقق من سبب الفشل
            let reason = "";
            try {
                // محاولة معرفة سبب الفشل
                const groupMeta = await sock.groupMetadata(chatId);
                const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const botParticipant = groupMeta.participants.find(p => p.id === botJid);
                
                if (!botParticipant?.admin) {
                    reason = "الــبــوت لــيــس مــشــرفــاً";
                } else {
                    reason = "الــرقــم لــيــس لــه حــســاب واتــســاب أو مــحــظــور";
                }
            } catch (err) {
                reason = "الــرقــم لــيــس لــه حــســاب واتــســاب";
            }
            
            await sock.sendMessage(chatId, {
                text: `*‏❖══════ •『❌』• ══════❖*\n\n*❍↵ فــشــل إضــافــة الــرقــم*\n\n*▸ ${number}*\n\n*⚠️ ${reason}*\n\n*‏❖══════ •『💐』• ══════❖*`
            }, { quoted: msg });
            
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: msg.key }
            });
        }
        
    } catch (err) {
        console.error("❌ فشل الإضافة:", err);
        console.error("تفاصيل:", err.message);
        
        let errorMsg = `*‏❖══════ •『❌』• ══════❖*\n\n*❍↵ فــشــل إضــافــة الــرقــم*\n\n*▸ ${number}*\n\n`;
        
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes("not-authorized") || errorMessage.includes("403")) {
            errorMsg += `*⚠️ الــبــوت لــيــس لــديــه صــلاحــيــة*\n`;
        } else if (errorMessage.includes("exist") || errorMessage.includes("already")) {
            errorMsg += `*⚠️ الــرقــم مــوجــود بــالــفــعــل*\n`;
        } else if (errorMessage.includes("invalid") || errorMessage.includes("400")) {
            errorMsg += `*⚠️ الــرقــم غــيــر صــالــح*\n`;
        } else if (errorMessage.includes("429")) {
            errorMsg += `*⚠️ كــثــرة الــطــلــبــات*\n`;
        } else if (errorMessage.includes("blocked")) {
            errorMsg += `*⚠️ الــرقــم مــحــظــور*\n`;
        } else {
            errorMsg += `*⚠️ الــرقــم لــيــس لــه حــســاب واتــســاب*\n`;
        }
        
        errorMsg += `\n*‏❖══════ •『💐』• ══════❖*`;
        
        await sock.sendMessage(chatId, { text: errorMsg }, { quoted: msg });
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
}

export default { NovaUltra, execute };