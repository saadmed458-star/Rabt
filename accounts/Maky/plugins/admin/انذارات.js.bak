// plugins/الانذارات.js
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

export const NovaUltra = {
    command: "الانذارات",
    description: "عرض قائمة الإنذارات في المجموعة",
    category: "الادارة",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg }) {
    const groupId = msg.key.remoteJid;

    if (!groupId.endsWith('@g.us')) {
        return await sock.sendMessage(groupId, {
            text: '*╻❌╹↵ هذا الأمر يعمل فقط في المجموعات.*'
        }, { quoted: msg });
    }

    const warnings = loadWarnings();
    const groupWarnings = warnings[groupId] || {};
    
    const warningList = Object.entries(groupWarnings);
    
    if (warningList.length === 0) {
        return await sock.sendMessage(groupId, {
            text: '*╻✅╹↵ لا يوجد إنذارات في هذه المجموعة.*'
        }, { quoted: msg });
    }

    let message = `*╻📋╹↵ قـائـمـة الإنـذارات ╹↵*\n\n╻━━━━━━━━━━━━╹↵\n`;
    const mentions = [];
    
    for (const [jid, count] of warningList) {
        const number = jid.split('@')[0];
        
        // أيقونة حسب عدد الإنذارات
        let icon = '⚠️';
        if (count === 2) icon = '⚠️⚠️';
        if (count === 3) icon = '⚠️⚠️⚠️';
        
        message += `*${icon} @${number}* : ${count}/4 إنذارات\n`;
        message += `╻━━━━━━━━━━━━╹↵\n`;
        mentions.push(jid);
    }
    
    message += `\n*╻⚠️╹↵ عند وصول 4 إنذارات يتم الطرد تلقائياً.*`;

    await sock.sendMessage(groupId, {
        text: message,
        mentions: mentions
    }, { quoted: msg });
}

export default { NovaUltra, execute };