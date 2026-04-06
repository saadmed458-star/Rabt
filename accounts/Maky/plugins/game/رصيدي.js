// plugins/النظام/رصيدي.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userDataFile = path.join(__dirname, '../nova/data/users.json');

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    } catch {
        return {};
    }
}

export const NovaUltra = {
    command: ["رصيدي", "رصيد"],
    description: "عرض رصيدك من النقاط والألماس",
    category: "نظام",
    elite: "off",
    group: true,
    prv: true,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    
    const users = loadUsers();
    const user = users[senderNumber] || { points: 0, diamonds: 0, coins: 0 };
    
    const result = `*‏❖══════ •『📊』• ══════❖*\n\n*❍↵ رصــيــدك الــحــالــي*\n\n*▸ 💎 الألمــاس:* ${user.diamonds || 0}\n*▸ 🪙 الــعــمــلات:* ${user.coins || 0}\n*▸ ⭐ الــنــقــاط:* ${user.points || 0}\n\n*‏❖══════ •『💐』• ══════❖*\n> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`;
    
    await sock.sendMessage(chatId, { text: result }, { quoted: msg });
}

export default { NovaUltra, execute };