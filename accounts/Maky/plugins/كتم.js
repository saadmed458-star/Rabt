// plugins/كتم.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mutedFile = path.join(__dirname, '../nova/data/muted.json');
const dataDir = path.join(__dirname, '../nova/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(mutedFile)) fs.writeFileSync(mutedFile, JSON.stringify({}));

function loadMuted() {
    try {
        return JSON.parse(fs.readFileSync(mutedFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveMuted(data) {
    fs.writeFileSync(mutedFile, JSON.stringify(data, null, 2), 'utf8');
}

export const NovaUltra = {
    command: "كتم",
    description: "كتم عضو",
    elite: "off",
    group: true,
    admin: true
};

export async function handleMute(sock, msg) {
    try {
        const groupId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const mutedData = loadMuted();
        const groupMuted = mutedData[groupId] || [];
        
        if (groupMuted.includes(sender)) {
            await sock.sendMessage(groupId, {
                delete: {
                    remoteJid: groupId,
                    fromMe: false,
                    id: msg.key.id,
                    participant: sender
                }
            }).catch(() => {});
        }
    } catch (err) {}
}

async function execute({ sock, msg }) {
    const groupId = msg.key.remoteJid;
    if (!groupId.endsWith('@g.us')) {
        return await sock.sendMessage(groupId, { text: '*╻❌╹↵ هذا الأمر يعمل فقط في المجموعات.*' }, { quoted: msg });
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let targetJid = quoted?.participant;
    
    if (!targetJid) {
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJids && mentionedJids.length > 0) {
            targetJid = mentionedJids[0];
        }
    }

    if (!targetJid) {
        return await sock.sendMessage(groupId, { text: '*╻❌╹↵ رد على رسالة الشخص أو قم بمنشنه.*' }, { quoted: msg });
    }

    const targetNumber = targetJid.split('@')[0];
    const mutedData = loadMuted();
    const groupMuted = mutedData[groupId] || [];
    const isMuted = groupMuted.includes(targetJid);

    if (isMuted) {
        const newGroupMuted = groupMuted.filter(jid => jid !== targetJid);
        if (newGroupMuted.length === 0) delete mutedData[groupId];
        else mutedData[groupId] = newGroupMuted;
        saveMuted(mutedData);
        await sock.sendMessage(groupId, { text: `*╻🔊╹↵ تـم فـك الـكـتـم عـن @${targetNumber}.*`, mentions: [targetJid] }, { quoted: msg });
    } else {
        groupMuted.push(targetJid);
        mutedData[groupId] = groupMuted;
        saveMuted(mutedData);
        await sock.sendMessage(groupId, { text: `*╻🔇╹↵ تـم كـتـم @${targetNumber}.*`, mentions: [targetJid] }, { quoted: msg });
    }
}

export default { NovaUltra, execute, handleMute };
