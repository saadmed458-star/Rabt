export const NovaUltra = {
    command: 'وصف',
    description: 'يسرق وصف المجموعة من الرابط',
    elite: 'off',
    group: false,
    prv: false,
    lock: 'off'
};

export default {
    NovaUltra,
    async execute({ sock, msg }) {
        try {
            const chatId = msg.key.remoteJid;
            const fullText = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
            const urlMatch = fullText.match(/https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
            
            if (!urlMatch) {
                await sock.sendMessage(chatId, { text: '❌ ما لقيت رابط مجموعة!' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

            const inviteCode = urlMatch[1];
            const groupMetadata = await sock.groupGetInviteInfo(inviteCode);
            
            if (!groupMetadata) throw new Error('ما لقيت المجموعة');

            const message = `*🔍 معلومات المجموعة المسروقة* 🤫

*● الاسم:* 【 ${groupMetadata.subject} 】
*● العدد:* 【 ${groupMetadata.size} 】
*● الوصف:* 
${groupMetadata.desc || 'ما في وصف'}

*🔗 الرابط:* ${urlMatch[0]}`;

            await sock.sendMessage(chatId, { text: message }, { quoted: msg });
            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error('❌ خطأ في سرقة-وصف:', error);
        }
    }
};
