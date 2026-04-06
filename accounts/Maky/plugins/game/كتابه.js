export const NovaUltra = {
    command: 'كتابة',
    description: 'فعالية الكتابة - تخمين أسماء الشخصيات (أكثر من 150 اسم)',
    elite: 'off',
    group: true,
    prv: false,
    lock: 'off'
};

// ========================
// ✅ كل الشخصيات
// ========================
const characters = [
    // ناروتو
    { name: 'ناروتو', names: ['ناروتو','Naruto','naruto'] },
    { name: 'ساسكي', names: ['ساسكي','Sasuke','sasuke'] },
    { name: 'ساكورا', names: ['ساكورا','Sakura','sakura'] },
    { name: 'كاكاشي', names: ['كاكاشي','Kakashi','kakashi'] },
    { name: 'جيرايا', names: ['جيرايا','Jiraiya','jiraiya'] },
    { name: 'اوروتشيمارو', names: ['اوروتشيمارو','Orochimaru','orochimaru'] },
    { name: 'هيناتا', names: ['هيناتا','Hinata','hinata'] },
    { name: 'نيجي', names: ['نيجي','Neji','neji'] },
    { name: 'روك لي', names: ['روك لي','Rock Lee','rock lee'] },
    { name: 'غاي', names: ['غاي','Gai','gai'] },

    // ون بيس
    { name: 'لوفي', names: ['لوفي','Luffy','luffy'] },
    { name: 'زورو', names: ['زورو','Zoro','zoro'] },
    { name: 'سانجي', names: ['سانجي','Sanji','sanji'] },
    { name: 'نامي', names: ['نامي','Nami','nami'] },
    { name: 'أوسوب', names: ['أوسوب','Usopp','usopp'] },
    { name: 'تشوبر', names: ['تشوبر','Chopper','chopper'] },
    { name: 'روبن', names: ['روبن','Robin','robin'] },
    { name: 'فرانكي', names: ['فرانكي','Franky','franky'] },
    { name: 'بروك', names: ['بروك','Brook','brook'] },
    { name: 'جينبي', names: ['جينبي','Jinbe','jinbe'] },

    // دراغون بول
    { name: 'غوكو', names: ['غوكو','Goku','goku'] },
    { name: 'فيجيتا', names: ['فيجيتا','Vegeta','vegeta'] },
    { name: 'غوهان', names: ['غوهان','Gohan','gohan'] },
    { name: 'ترانكس', names: ['ترانكس','Trunks','trunks'] },
    { name: 'بيكولو', names: ['بيكولو','Piccolo','piccolo'] },
    { name: 'ماستر روشي', names: ['ماستر روشي','Master Roshi','roshi'] },
    { name: 'فريزر', names: ['فريزر','Frieza','frieza'] },
    { name: 'سيل', names: ['سيل','Cell','cell'] },
    { name: 'بوروس', names: ['بوروس','Buu','buu'] },
    { name: 'جيرين', names: ['جيرين','Jiren','jiren'] },

    // هجوم العمالقة
    { name: 'إرين', names: ['إرين','Eren','eren'] },
    { name: 'ميكاسا', names: ['ميكاسا','Mikasa','mikasa'] },
    { name: 'أرمين', names: ['أرمين','Armin','armin'] },
    { name: 'ليفاي', names: ['ليفاي','Levi','levi'] },
    { name: 'هانجي', names: ['هانجي','Hange','hange'] },

    // ديمون سلاير
    { name: 'تانجيرو', names: ['تانجيرو','Tanjiro','tanjiro'] },
    { name: 'نيزوكو', names: ['نيزوكو','Nezuko','nezuko'] },
    { name: 'زينيتسو', names: ['زينيتسو','Zenitsu','zenitsu'] },
    { name: 'إينوسكي', names: ['إينوسكي','Inosuke','inosuke'] },

    // جوجوتسو كايسن
    { name: 'غوجو', names: ['غوجو','Gojo','gojo'] },
    { name: 'يوجي', names: ['يوجي','Yuji','yuji'] },

    // هانتر × هانتر
    { name: 'غون', names: ['غون','Gon','gon'] },
    { name: 'كيلوا', names: ['كيلوا','Killua','killua'] },

    // بليتش
    { name: 'إيتشيغو', names: ['إيتشيغو','Ichigo','ichigo'] },
    { name: 'روكيا', names: ['روكيا','Rukia','rukia'] },

    // ون بنش مان
    { name: 'سايتاما', names: ['سايتاما','Saitama','saitama'] },
    { name: 'جينوس', names: ['جينوس','Genos','genos'] }
];

// ========================
// ✅ تخزين الجلسات والنتائج
// ========================
const activeGames = new Map();
const scores = new Map();
const lastRun = new Map(); // سجل آخر تشغيل لكل مستخدم

export default {
    NovaUltra,
    async execute({ sock, msg, args }) {
        try {
            const chatId = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            const command = args[0]?.toLowerCase();

            // التحقق من المشرف
            let isAdmin = false;
            if (msg.isGroup) {
                const metadata = await sock.groupMetadata(chatId);
                const participant = metadata.participants.find(p => p.id === sender);
                isAdmin = participant?.admin !== null;
            } else {
                isAdmin = true; // دردشة خاصة
            }

            // ===========================
            // منع الأعضاء العاديين قبل 15 دقيقة
            // ===========================
            if ((command === 'كتابة' || command === 'ابدأ' || args.length === 0) && !isAdmin) {
                const last = lastRun.get(senderNumber);
                if (last && Date.now() - last < 15 * 60 * 1000) {
                    await sock.sendMessage(chatId, {
                        text: `⏱️ لم يمض 15 دقيقة منذ انتهاء آخر فعالية. انتظر قليلاً قبل إعادة التشغيل.`
                    });
                    return;
                }
            }

            // ===========================
            // حفظ وقت التشغيل
            // ===========================
            lastRun.set(senderNumber, Date.now());

            // ===========================
            // عرض النتائج
            // ===========================
            if (command === 'نتائج') {
                const groupScores = scores.get(chatId) || new Map();
                if (groupScores.size === 0) {
                    await sock.sendMessage(chatId, { text: `*┇⦏لا تـوجـد نـتـائـج بـعـد⦐┇*` });
                    return;
                }
                let results = `*┇⦏الـنـتـائـج الـحـالـيـة⦐┇*\n\n`;
                const sorted = Array.from(groupScores.entries()).sort((a, b) => b[1] - a[1]);
                sorted.forEach(([player, points], index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
                    results += `${medal} @${player.split('@')[0]} : ${points} نقطة\n`;
                });
                await sock.sendMessage(chatId, { text: results, mentions: sorted.map(s => s[0]) });
                return;
            }

            // ===========================
            // إيقاف الفعالية نهائياً
            // ===========================
            if (command === 'ايقاف' || command === 'إيقاف' || command === 'وقف') {
                if (activeGames.has(chatId)) {
                    const game = activeGames.get(chatId);
                    if (game.timeoutTimer) clearTimeout(game.timeoutTimer);
                    if (game.messageHandler) sock.ev.off('messages.upsert', game.messageHandler);
                    activeGames.delete(chatId);

                    // عرض النتائج النهائية
                    const groupScores = scores.get(chatId) || new Map();
                    if (groupScores.size > 0) {
                        let results = `*┇⦏نتـ📊ـائج الفعـ📻ـالية⦐┇*\n\n`;
                        const sorted = Array.from(groupScores.entries()).sort((a, b) => b[1] - a[1]);
                        sorted.forEach(([player, points], index) => {
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
                            results += `${medal} @${player.split('@')[0]} : ${points} نقطة\n`;
                        });
                        await sock.sendMessage(chatId, { text: results, mentions: sorted.map(s => s[0]) });
                        scores.delete(chatId);
                    }

                    await sock.sendMessage(chatId, {
                        text: `*┇⦏تـ🛑ـم إيـقـاف الـفـعـالـيـة⦐┇*`
                    });
                } else {
                    await sock.sendMessage(chatId, { text: `*┇⦏لا تـوجـد فـعـالـيـة قـائـمـة⦐┇*` });
                }
                return;
            }

            // ===========================
            // بدء الفعالية
            // ===========================
            if (command === 'كتابة' || command === 'ابدأ' || args.length === 0) {
                if (activeGames.has(chatId)) {
                    await sock.sendMessage(chatId, { text: `*┇⦏الـفـعـالـيـة قـائـمـة بـالـفـعـل⦐┇*` });
                    return;
                }

                await sock.sendMessage(chatId, { react: { text: '🎮', key: msg.key } });

                if (!scores.has(chatId)) scores.set(chatId, new Map());

                let timeoutTimer = null;
                let currentCharacter = null;
                let isRoundActive = false;
                let answered = false;
                let usedWords = [];

                // ===========================
                // دالة إرسال كلمة جديدة
                // ===========================
                const sendNewWord = async () => {
                    if (isRoundActive) return;
                    isRoundActive = true;
                    answered = false;

                    if (usedWords.length >= characters.length) usedWords = [];

                    const availableCharacters = characters.filter(c => !usedWords.includes(c.name));
                    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
                    currentCharacter = availableCharacters[randomIndex];
                    usedWords.push(currentCharacter.name);

                    await sock.sendMessage(chatId, { text: `*⌗الــــكــــلــــمــــة 🔖『 ${currentCharacter.name} 』*` });

                    if (timeoutTimer) clearTimeout(timeoutTimer);
                    timeoutTimer = setTimeout(() => {
                        if (!answered && activeGames.has(chatId)) {
                            isRoundActive = false;
                            sendNewWord();
                        }
                    }, 3 * 60 * 1000);
                };

                // ===========================
                // معالج الردود
                // ===========================
                const messageHandler = async ({ messages }) => {
                    const newMsg = messages[0];
                    if (!newMsg.message || newMsg.key.remoteJid !== chatId) return;
                    if (!isRoundActive || answered) return;

                    const answer = newMsg.message?.conversation || newMsg.message?.extendedTextMessage?.text || '';
                    const trimmedAnswer = answer.toLowerCase().trim();
                    if (!trimmedAnswer) return;

                    const responder = newMsg.key.participant || newMsg.key.remoteJid;
                    const groupScores = scores.get(chatId);

                    const isCorrect = currentCharacter?.names?.some(name => trimmedAnswer === name.toLowerCase());
                    if (isCorrect) {
                        answered = true;
                        isRoundActive = false;
                        if (timeoutTimer) clearTimeout(timeoutTimer);

                        const currentPoints = groupScores.get(responder) || 0;
                        const newPoints = currentPoints + 1;
                        groupScores.set(responder, newPoints);

                        await sock.sendMessage(chatId, {
                            text: `✅ @${responder.split('@')[0]} جاوب صح! لديه الآن ${newPoints} نقاط`,
                            mentions: [responder]
                        });

                        // ===========================
                        // تحقق من الفوز 30 نقطة
                        // ===========================
                        if (newPoints >= 30) {
                            let results = `*┇⦏🏆 الفائز النهائي 🏆⦐┇*\n\n`;
                            const sorted = Array.from(groupScores.entries()).sort((a, b) => b[1] - a[1]);
                            sorted.forEach(([player, points], index) => {
                                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
                                results += `${medal} @${player.split('@')[0]} : ${points} نقطة\n`;
                            });
                            await sock.sendMessage(chatId, { text: results, mentions: sorted.map(s => s[0]) });
                            activeGames.delete(chatId);
                            return;
                        }

                        setTimeout(() => {
                            if (activeGames.has(chatId)) {
                                isRoundActive = false;
                                sendNewWord();
                            }
                        }, 4000);
                    }
                };

                sock.ev.on('messages.upsert', messageHandler);

                setTimeout(() => sendNewWord(), 1000);

                activeGames.set(chatId, { timeoutTimer, currentCharacter, isRoundActive, answered, usedWords, messageHandler });
                return;
            }

        } catch (error) {
            console.error('❌ خطأ في كتابة:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ' }, { quoted: msg });
        }
    }
};