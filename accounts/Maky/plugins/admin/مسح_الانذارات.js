// plugins/مسح-انذارات.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const warningsFile = path.join(__dirname, '../nova/data/warnings.json');

function loadWarnings() {
    try {
        return JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2), 'utf8');
}

export const NovaUltra = {
    command: "مسح",
    description: "مسح إنذارات عضو معين",
    category: "الادارة",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true      // فقط المشرفين
};

async function execute({ sock, msg }) {
    const groupId = msg.key.remoteJid;

    // التأكد أن الأمر في مجموعة
    if (!groupId.endsWith('@g.us')) {
        return await sock.sendMessage(groupId, {
            text: '*╻❌╹↵ هذا الأمر يعمل فقط في المجموعات.*'
        }, { quoted: msg });
    }

    // الحصول على الشخص المطلوب (الرد على رسالة أو منشن)
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let targetJid = quoted?.participant;
    
    // إذا لم يكن هناك رد، نبحث عن منشن
    if (!targetJid) {
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJids && mentionedJids.length > 0) {
            targetJid = mentionedJids[0];
        }
    }

    if (!targetJid) {
        return await sock.sendMessage(groupId, {
            text: '*╻❌╹↵ رد على رسالة الشخص أو قم بمنشنه.*\n*مثال:* `.مسح انذارات @الشخص`'
        }, { quoted: msg });
    }

    const targetNumber = targetJid.split('@')[0];
    const warnings = loadWarnings();
    const groupWarnings = warnings[groupId] || {};

    if (!groupWarnings[targetJid]) {
        return await sock.sendMessage(groupId, {
            text: `*╻✅╹↵ @${targetNumber} لا يوجد لديه إنذارات.*`,
            mentions: [targetJid]
        }, { quoted: msg });
    }

    const oldWarnings = groupWarnings[targetJid];
    
    // مسح الإنذارات
    delete groupWarnings[targetJid];
    warnings[groupId] = groupWarnings;
    saveWarnings(warnings);

    await sock.sendMessage(groupId, {
        text: `*╻✅╹↵ تـم مـسـح ${oldWarnings} إنذار عن @${targetNumber}.*`,
        mentions: [targetJid]
    }, { quoted: msg });
    
    await sock.sendMessage(groupId, {
        react: { text: '🧹', key: msg.key }
    });
}

export default { NovaUltra, execute };