// plugins/المجموعات/ترقية.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ المستمع
let listenerAttached = false;

export const NovaUltra = {
    command: "ترقية",
    description: "تفعيل مراقبة ترقية المشرفين",
    category: "الادارة",
    elite: "on",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const action = args[0]?.toLowerCase();
    
    // التحقق من أن الأمر في مجموعة
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: `.╹↵ *⚠️ هـذا الأمـر يـعـمـل فـي الـمـجـمـوعـات فـقـط* .╹↵`
        }, { quoted: msg });
    }
    
    // إيقاف المراقبة
    if (action === "ايقاف" || action === "off") {
        if (sock._promoteListenerActive) {
            sock._promoteListenerActive = false;
            await sock.sendMessage(chatId, {
                text: `.╹↵ *✅ تـم إيـقـاف مـراقـبـة تـرقـيـة الأعـضـاء* .╹↵`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chatId, {
                text: `.╹↵ *⚠️ الـمـراقـبـة غـيـر مـفـعـلـة أصـلاً* .╹↵`
            }, { quoted: msg });
        }
        return;
    }
    
    // تفعيل المراقبة
    sock._promoteListenerActive = true;
    
    await sock.sendMessage(chatId, {
        text: `.╹↵ *🔒 تـم تـفـعـيـل مـراقـبـة تـرقـيـة الأعـضـاء* .╹↵\n\n.╹↵ *✅ سـيـتـم إرسـال تـنـبـيـه عـنـد تـرقـيـة أي عـضـو* .╹↵\n\n.╹↵ *⚠️ لـإيـقـاف الـمـراقـبـة:* .╹↵\n.╹↵ *.ترقية ايقاف* .╹↵`
    }, { quoted: msg });
    
    // إضافة مستمع دائم إذا لم يضاف من قبل
    if (!listenerAttached) {
        sock.ev.on('group-participants.update', async (update) => {
            // إذا كانت المراقبة غير مفعلة
            if (!sock._promoteListenerActive) return;
            
            // إذا كان التحديث ليس ترقية
            if (update.action !== 'promote') return;
            
            const groupId = update.id;
            
            try {
                for (const participant of update.participants) {
                    const promotedNumber = participant.split('@')[0];
                    
                    // رسالة التنبيه
                    const promoteMessage = `.╹↵ *🔔 تـنـبـيـه تـرقـيـة* .╹↵\n\n.╹↵ *👤 الـعـضـو:* @${promotedNumber} .╹↵\n.╹↵ *👑 تـم تـرقـيـتـه إلـى مـشـرف* .╹↵\n\n.╹↵ *🕐 الـوقـت:* ${new Date().toLocaleTimeString('ar-EG')} .╹↵\n.╹↵ *📅 الـتـاريـخ:* ${new Date().toLocaleDateString('ar-EG')} .╹↵\n\n.╹↵ *🛡️ 𝑲𝑹𝑶𝑳𝑳𝑶 - 𝑩𝛩𝑻* .╹↵`;
                    
                    await sock.sendMessage(groupId, {
                        text: promoteMessage,
                        mentions: [participant]
                    });
                    
                    await sock.sendMessage(groupId, {
                        react: { text: '🔔', key: update.id }
                    });
                    
                    console.log(`✅ تم إرسال تنبيه ترقية للعضو: ${promotedNumber}`);
                }
            } catch (err) {
                console.error("❌ خطأ في إرسال تنبيه الترقية:", err);
            }
        });
        
        listenerAttached = true;
        console.log("✅ مستمع الترقية تم تفعيله");
    }
}

export default { NovaUltra, execute };