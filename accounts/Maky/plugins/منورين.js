// plugins/منورين.js

// تخزين حالة الترحيب لكل مجموعة
const welcomeSettings = new Map();
const welcomedParticipants = new Set();

export const NovaUltra = {
    command: ["منورين"],
    description: "تشغيل أو إيقاف الترحيب التلقائي بالأعضاء الجدد",
    elite: "off",
    group: true,
    admin: true
};

export async function handleWelcome(sock, update) {
    try {
        const groupId = update.id;
        const isActive = welcomeSettings.get(groupId);
        
        if (!isActive || update.action !== 'add') return;

        for (const participant of update.participants) {
            if (welcomedParticipants.has(participant)) continue;

            try {
                let ppUrl = null;
                try {
                    ppUrl = await sock.profilePictureUrl(participant, 'image');
                } catch {
                    try {
                        ppUrl = await sock.profilePictureUrl(groupId, 'image');
                    } catch {}
                }

                const welcomeMessage = `*╻🍷╹↵ مرحباً بك في المجموعة*\n\n*@${participant.split('@')[0]}*\n\n*╻🔥╹↵ نتمنى لك قضاء وقت ممتع معنا*`;

                if (ppUrl) {
                    await sock.sendMessage(groupId, {
                        image: { url: ppUrl },
                        caption: welcomeMessage,
                        mentions: [participant]
                    });
                } else {
                    await sock.sendMessage(groupId, {
                        text: welcomeMessage,
                        mentions: [participant]
                    });
                }

                welcomedParticipants.add(participant);
                setTimeout(() => welcomedParticipants.delete(participant), 60000);

            } catch (err) {
                console.error('خطأ في الترحيب:', err);
            }
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

export async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const status = args[0];

    if (status === 'off' || status === 'ايقاف') {
        welcomeSettings.set(chatId, false);
        await sock.sendMessage(chatId, { 
            text: '*╻⛔╹↵ تم تعطيل الترحيب.*' 
        }, { quoted: msg });
    } else {
        welcomeSettings.set(chatId, true);
        await sock.sendMessage(chatId, { 
            text: '*╻✅╹↵ تم تفعيل الترحيب.*' 
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute, handleWelcome };
