// plugins/المجموعات/الكل.js
import { jidDecode } from "@whiskeysockets/baileys";
import config from '../../nova/config.js';

const NovaUltra = {
    command: ["الكل", "منشن"],
    description: "منشن جميع أعضاء المجموعة (للمشرفين فقط)",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

function decode(jid) {
    return (jidDecode(jid)?.user || jid.split("@")[0]) + "@s.whatsapp.net";
}

async function isGroupAdmin(sock, chatId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = decode(msg.key.participant || chatId);
    
    try {
        // التحقق من أن المرسل مشرف
        const isAdmin = await isGroupAdmin(sock, chatId, sender);
        
        if (!isAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, {
                react: { text: '⚠️', key: msg.key }
            });
            await sock.sendMessage(chatId, {
                text: "*‏❖══════ •『🛡️』• ══════❖*\n\n*❍↵ هــذا الأمــر مــتــاح فــقــط لــلــمــشــرفــيــن.*"
            }, { quoted: msg });
            return;
        }
        
        await sock.sendMessage(chatId, {
            react: { text: '⏳', key: msg.key }
        });
        
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const groupOwner = groupMetadata.owner;
        
        await sock.sendMessage(chatId, {
            react: { text: '⚙️', key: msg.key }
        });
        
        // تصنيف الأعضاء
        const owner = [];
        const admins = [];
        const members = [];
        const ownerNumber = config.owner?.toString().replace(/\D/g, '') + "@s.whatsapp.net";
        
        for (const participant of participants) {
            const isOwner = participant.id === groupOwner || participant.id === ownerNumber;
            const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
            
            if (isOwner) owner.push(participant.id);
            else if (isAdmin) admins.push(participant.id);
            else members.push(participant.id);
        }
        
        const extraMsg = args.length > 0 ? args.join(" ") : "";
        const mentions = participants.map(p => p.id);
        
        await sock.sendMessage(chatId, {
            react: { text: '📤', key: msg.key }
        });
        
        // بناء الرسالة
        let tagMessage = `*‏❖══════ •『🔔』• ══════❖*\n\n`;
        tagMessage += `*❍↵ تــنــبــيــه عــام*\n\n`;
        
        if (extraMsg) {
            tagMessage += `*❍↵ الــرســالــة:*\n*▸ "${extraMsg}"*\n\n`;
        }
        
        tagMessage += `*❃━═━═✦•〘•📊•〙•✦═━═━❃*\n\n`;
        tagMessage += `*▸ الــمــالــك :* ${owner.length}\n`;
        tagMessage += `*▸ الــمــشــرفــيــن :* ${admins.length}\n`;
        tagMessage += `*▸ الأعــضــاء :* ${members.length}\n`;
        tagMessage += `*▸ الإجــمــالــي :* ${participants.length}\n\n`;
        
        tagMessage += `*❃━═━═✦•〘•👑•〙•✦═━═━❃*\n\n`;
        
        // عرض المالك
        if (owner.length > 0) {
            tagMessage += `*▸ الــمــالــك :*\n`;
            owner.forEach(id => {
                tagMessage += `┊ @${id.split('@')[0]}\n`;
            });
            tagMessage += `\n`;
        }
        
        // عرض المشرفين
        if (admins.length > 0) {
            tagMessage += `*▸ الــمــشــرفــيــن :*\n`;
            admins.forEach(id => {
                tagMessage += `┊ @${id.split('@')[0]}\n`;
            });
            tagMessage += `\n`;
        }
        
        // عرض الأعضاء
        if (members.length > 0) {
            tagMessage += `*▸ الأعــضــاء :*\n`;
            const chunkSize = 30;
            for (let i = 0; i < members.length; i += chunkSize) {
                const chunk = members.slice(i, i + chunkSize);
                chunk.forEach(id => {
                    tagMessage += `┊ @${id.split('@')[0]}\n`;
                });
            }
            tagMessage += `\n`;
        }
        
        tagMessage += `*‏❖══════ •『💐』• ══════❖*\n\n`;
        tagMessage += `*❍↵ تــم الــتــنــبــيــه بــواســطــة :* @${sender.split('@')[0]}\n\n`;
        tagMessage += `> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
        
        await sock.sendMessage(chatId, {
            text: tagMessage,
            mentions: mentions
        }, { quoted: msg });
        
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: msg.key }
        });
        
    } catch (error) {
        console.error("❌ خطأ في أمر الكل:", error);
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: msg.key }
        });
        await sock.sendMessage(chatId, { 
            text: "*‏❖══════ •『❌』• ══════❖*\n\n*❍↵ حــدث خــطــأ أثــنــاء مــحــاولــة مــنــشــن الأعــضــاء.*"
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute };