// plugins/المجموعات/مراقبة.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ المجموعات المراقبة
const monitorFile = path.join(__dirname, '../../nova/data/monitor_groups.json');

// التأكد من وجود المجلد والملف
const dataDir = path.join(__dirname, '../../nova/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(monitorFile)) fs.writeFileSync(monitorFile, JSON.stringify({}));

// الأشخاص المسموح لهم بالرفع
const ALLOWED_ADMINS = [
    "22248049282",
    "963985827174"
];

function loadMonitorGroups() {
    try {
        return JSON.parse(fs.readFileSync(monitorFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveMonitorGroups(data) {
    fs.writeFileSync(monitorFile, JSON.stringify(data, null, 2), 'utf8');
}

async function demoteUser(sock, groupId, userId) {
    try {
        await sock.groupParticipantsUpdate(groupId, [userId], 'demote');
        return true;
    } catch (err) {
        console.error(`❌ فشل سحب الإشراف من ${userId}:`, err);
        return false;
    }
}

export const NovaUltra = {
    command: "مراقبة",
    description: "تفعيل أو تعطيل مراقبة رفع المشرفين",
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
    
    const monitorGroups = loadMonitorGroups();
    
    if (action === "ايقاف" || action === "off") {
        if (monitorGroups[chatId]) {
            delete monitorGroups[chatId];
            saveMonitorGroups(monitorGroups);
            await sock.sendMessage(chatId, {
                text: `.╹↵ *✅ تـم إيـقـاف مـراقـبـة رفـع الـمـشـرفـيـن فـي هـذه الـمـجـمـوعـة* .╹↵`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chatId, {
                text: `.╹↵ *⚠️ الـمـراقـبـة غـيـر مـفـعـلـة أصـلاً* .╹↵`
            }, { quoted: msg });
        }
        return;
    }
    
    // تفعيل المراقبة
    monitorGroups[chatId] = true;
    saveMonitorGroups(monitorGroups);
    
    await sock.sendMessage(chatId, {
        text: `.╹↵ *🔒 تـم تـفـعـيـل مـراقـبـة رفـع الـمـشـرفـيـن* .╹↵\n\n.╹↵ *✅ الأرقــام الــمــســمــوح لــهــا بــالــرفــع:* .╹↵\n.╹↵ *@22248049282* .╹↵\n.╹↵ *@963985827174* .╹↵\n\n.╹↵ *⚠️ أي شخص آخر يحاول رفع مشرف سيتم سحب إشرافه فوراً* .╹↵`,
        mentions: ["22248049282@s.whatsapp.net", "963985827174@s.whatsapp.net"]
    }, { quoted: msg });
    
    // إضافة مستمع دائم للمجموعة
    if (!sock._monitorListenerAttached) {
        sock.ev.on('group-participants.update', async (update) => {
            const groupId = update.id;
            const currentMonitorGroups = loadMonitorGroups();
            
            if (!currentMonitorGroups[groupId]) return;
            if (update.action !== 'promote') return;
            
            try {
                for (const participant of update.participants) {
                    const isAllowed = ALLOWED_ADMINS.some(admin => participant.includes(admin));
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    
                    if (!isAllowed && participant !== botJid) {
                        console.log(`⚠️ محاولة رفع غير مصرح بها من: ${participant}`);
                        
                        await demoteUser(sock, groupId, participant);
                        
                        await sock.sendMessage(groupId, {
                            text: `.╹↵ *🚨 تـم رصـد مـحـاولـة رفـع غـيـر مـصـرح بـهـا* .╹↵\n\n.╹↵ *👤 الـشـخـص:* @${participant.split('@')[0]} .╹↵\n.╹↵ *🔻 تـم سـحـب الإشـراف فـوراً* .╹↵\n\n.╹↵ *✅ الأرقــام الــمــســمــوح لــهــا فــقــط:* .╹↵\n.╹↵ *@22248049282* .╹↵\n.╹↵ *@963985827174* .╹↵`,
                            mentions: [participant, "22248049282@s.whatsapp.net", "963985827174@s.whatsapp.net"]
                        });
                    }
                }
            } catch (err) {
                console.error("❌ خطأ في مراقبة المجموعة:", err);
            }
        });
        sock._monitorListenerAttached = true;
        console.log("✅ مستمع مراقبة المشرفين تم تفعيله");
    }
}

export default { NovaUltra, execute };