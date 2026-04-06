import fs from 'fs';
import path from 'path';

export const NovaUltra = {
    command: ["خمن"],
    description: "فعالية معرفة الشخصية من الصورة",
    group: true,
    prv: false
};

const folder = "/storage/emulated/0/bot/accounts/Maky/sor";
const games = new Map();

// تحميل الصور مرة واحدة
let files = [];
try {
    files = fs.readdirSync(folder).filter(f =>
        f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')
    );
} catch (e) {
    console.error(e);
}

// خلط الصور
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

export default {
    NovaUltra,
    async execute({ sock, msg, args }) {
        const chatId = msg.key.remoteJid;

        try {
            const input = args.join(" ");

            // 🛑 إيقاف الفعالية
            if (input === "ايقاف") {
                if (!games.has(chatId)) {
                    return sock.sendMessage(chatId, { text: "❌ لا توجد فعالية" }, { quoted: msg });
                }

                const game = games.get(chatId);
                game.ended = true;
                sock.ev.off('messages.upsert', game.handler);
                games.delete(chatId);

                return sock.sendMessage(chatId, { text: "🛑 تم إيقاف الفعالية" }, { quoted: msg });
            }

            if (games.has(chatId)) {
                return sock.sendMessage(chatId, {
                    text: "⚠️ الفعالية شغالة بالفعل!\n.صور ايقاف لإيقافها"
                }, { quoted: msg });
            }

            const clean = s => s.toLowerCase().replace(/\s+/g, '');

            const gameData = {
                answer: "",
                ended: false,
                locked: false, // 🔒 يمنع تعدد الفائزين
                handler: null,
                scores: {},
                list: shuffle([...files]),
                index: 0
            };

            // بدء جولة جديدة
            const startRound = async () => {
                const game = games.get(chatId);
                if (!game || game.ended) return;

                if (game.index >= game.list.length) {
                    game.ended = true;
                    sock.ev.off('messages.upsert', game.handler);
                    games.delete(chatId);

                    return sock.sendMessage(chatId, {
                        text: "📁 انتهت كل الصور!"
                    });
                }

                const file = game.list[game.index++];
                game.answer = file.replace(/\.[^/.]+$/, "");
                game.locked = false; // 🔓 فتح الجولة

                const imagePath = path.join(folder, file);

                await sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: 
`*❁اعرف اسم الشخصية : ➺* 
*⌬━─━═━𓆩🪻𓆪━═━─━⌬*
*❁المستوى 📊 : 『متوسط』 ➺* 

*❁المده ⏳ : 『4 دقائق』 ➺* 

*❁المكافأة 💎: 『20K』 ➺* 

*❁الـمــقـ🤵🏻‍♂ـدم : 〘〙➥* 
*⌬━─━═━𓆩⚜️𓆪━═━─━⌬*
*˼‏⸙˹ تــ✍︎ــوقــيــع :*
『𝐇.𝐊.𝐑 ⊰🪻⊱𝑳𝑨𝑽𝑬𝑵𝑫𝑬𝑹 』`
                });
            };

            // معالجة الردود
            const handler = async ({ messages }) => {
                const m = messages[0];
                if (!m.message || m.key.remoteJid !== chatId) return;

                const game = games.get(chatId);
                if (!game || game.ended || game.locked) return;

                const text = m.message.conversation || m.message.extendedTextMessage?.text;
                if (!text || text.startsWith('.')) return;

                const sender = m.key.participant || m.key.remoteJid;

                if (clean(text) === clean(game.answer)) {
                    game.locked = true; // 🔒 قفل الجولة فورًا

                    // تحديث النقاط
                    game.scores[sender] = (game.scores[sender] || 0) + 1;
                    const points = game.scores[sender];

                    await sock.sendMessage(chatId, {
                        text: `🏆 @${sender.split('@')[0]} أول من جاوب!\n💎 نقاطه: ${points}\n✨ الإجابة الصحيحة: ${game.answer}`,
                        mentions: [sender]
                    });

                    // الفوز النهائي عند 15 نقطة
                    if (points >= 15) {
                        game.ended = true;
                        sock.ev.off('messages.upsert', game.handler);
                        games.delete(chatId);

                        return sock.sendMessage(chatId, {
                            text: `👑 الفائز النهائي: @${sender.split('@')[0]} ✨`,
                            mentions: [sender]
                        });
                    }

                    // ⛔ جولة جديدة بعد فوز
                    setTimeout(() => {
                        if (!game.ended) startRound();
                    }, 1200);
                }
            };

            gameData.handler = handler;
            games.set(chatId, gameData);

            sock.ev.on('messages.upsert', handler);

            await startRound();

            // انتهاء الوقت لكل صورة
            setTimeout(async () => {
                const game = games.get(chatId);
                if (!game || game.ended) return;
                game.ended = true;
                sock.ev.off('messages.upsert', game.handler);
                games.delete(chatId);

                await sock.sendMessage(chatId, {
                    text: `⏳ انتهى الوقت!\n❌ الإجابة الصحيحة: ${gameData.answer}`
                });
            }, 4 * 60 * 1000); // 4 دقائق

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: "❌ خطأ في الفعالية" }, { quoted: msg });
        }
    }
};