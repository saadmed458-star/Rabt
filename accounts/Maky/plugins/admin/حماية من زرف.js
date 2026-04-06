// plugins/حماية.js
import fs from 'fs';
import path from 'path';
import { jidDecode } from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملفات البيانات
const dataDir = path.join(__dirname, '../nova/data');
const monitorFile = path.join(dataDir, 'monitorState.json');

// التأكد من وجود المجلد والملف
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(monitorFile)) fs.writeFileSync(monitorFile, JSON.stringify({}));

// قائمة النخبة (يمكن تعديلها حسب احتياجك)
const ALLOWED_ADMINS = [
    "972533933401",  // رقم المالك
    // أضف أرقام النخبة هنا
];

// دوال مساعدة
const loadMonitorState = () => {
    try {
        return JSON.parse(fs.readFileSync(monitorFile, 'utf8'));
    } catch (err) {
        console.error("خطأ في قراءة ملف المراقبة:", err);
        return {};
    }
};

const saveMonitorState = (data) => {
    try {
        fs.writeFileSync(monitorFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("خطأ في حفظ ملف المراقبة:", err);
    }
};

let handlerAttached = false;
const cooldowns = {};

export const NovaUltra = {
    command: "حماية",
    description: "يسحب الإشراف من غير النخبة ويعيد ترقية النخبة تلقائياً عند أي تغيير.",
    category: "حمايه من الزرف",
    elite: "on",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg }) {
    const groupId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // التأكد أن الأمر في مجموعة
    if (!groupId.endsWith('@g.us')) {
        return await sock.sendMessage(groupId, { 
            text: '*╻❌╹↵ هذا الأمر يعمل فقط داخل المجموعات.*' 
        }, { quoted: msg });
    }

    const senderNumber = (sender || '').split('@')[0];
    
    // التحقق من أن المرسل من النخبة
    if (!ALLOWED_ADMINS.includes(senderNumber)) {
        return await sock.sendMessage(groupId, { 
            text: '*╻❌╹↵ أنـت مـش نـخـبـة يـأعـأق لاتـزعـجـنـي مـࢪة ثـأنـيـة*' 
        }, { quoted: msg });
    }

    const state = loadMonitorState();

    // إذا كانت الحماية مفعلة، نقوم بتعطيلها
    if (state[groupId]) {
        delete state[groupId];
        saveMonitorState(state);
        return await sock.sendMessage(groupId, { 
            text: '*╻⚡╹↵ تـم الـغـأء الـحـمـايـة الـمـطـلـقــة ╻🔥╹↵*' 
        }, { quoted: msg });
    }

    // تفعيل الحماية
    state[groupId] = true;
    saveMonitorState(state);
    await sock.sendMessage(groupId, { 
        text: '*╻⚡╹↵ تـم تـفـعـيـل الـحـمـأيـة المـطـلـقـة ╻🔥╹↵*' 
    }, { quoted: msg });

    // إذا كان المستمع مضاف مسبقاً، لا نضيفه مرة أخرى
    if (handlerAttached) return;

    // مستمع التغييرات في المجموعة
    sock.ev.on('group-participants.update', async (update) => {
        const currentState = loadMonitorState();
        const groupId = update.id;

        if (!currentState[groupId]) return;
        if (cooldowns[groupId]) return;

        cooldowns[groupId] = true;
        setTimeout(() => delete cooldowns[groupId], 1000);

        try {
            const metadata = await sock.groupMetadata(groupId);
            const botId = jidDecode(sock.user.id)?.user + '@s.whatsapp.net';
            const participants = metadata.participants;

            const toDemote = [];
            const toPromote = [];

            for (const p of participants) {
                const num = p.id.split('@')[0];
                const isAllowed = ALLOWED_ADMINS.includes(num);

                // سحب الإشراف من غير النخبة (ما عدا البوت والمالك)
                if (p.admin && !isAllowed && p.id !== botId && p.id !== metadata.owner) {
                    toDemote.push(p.id);
                }

                // ترقية النخبة إذا لم يكونوا مشرفين
                if (!p.admin && isAllowed) {
                    toPromote.push(p.id);
                }
            }

            if (toDemote.length === 0 && toPromote.length === 0) return;

            await sock.sendMessage(groupId, {
                text: '*╻❌╹↵ تـم أگـتـشـأف تـغـيـࢪأت فــي قـأئـمـة الـمـشـࢪفـيـن ╻⚡╹↵*'
            });

            // سحب الإشراف
            if (toDemote.length > 0) {
                for (let i = 0; i < toDemote.length; i += 1025) {
                    const chunk = toDemote.slice(i, i + 1025);
                    await sock.groupParticipantsUpdate(groupId, chunk, 'demote').catch(console.error);
                    if (i + 1025 < toDemote.length) await new Promise(res => setTimeout(res, 10));
                }
            }

            // ترقية النخبة
            if (toPromote.length > 0) {
                for (let i = 0; i < toPromote.length; i += 1025) {
                    const chunk = toPromote.slice(i, i + 1025);
                    await sock.groupParticipantsUpdate(groupId, chunk, 'promote').catch(console.error);
                    if (i + 1025 < toPromote.length) await new Promise(res => setTimeout(res, 10));
                }
            }

            await sock.sendMessage(groupId, {
                text: `*╻✅╹↵ تـم سـحـب الإشــراف مــن ╻→╹↵* ${toDemote.length} *عــضــو* ${toDemote.length === 1 ? '' : 'اً'} *╻✅╹↵ وتــم تـرقــيــة ↵* ${toPromote.length} *مــن الـنــخــبــة. ╻🔥╹↵*`
            });

        } catch (err) {
            console.error("خطأ أثناء تنفيذ الحماية:", err);
        }
    });

    handlerAttached = true;
}

export default { NovaUltra, execute };