export const NovaUltra = {
    command: 'انمي',
    description: '✨ فعالية أسئلة الأنمي - جاوب واجمع النقاط',
    elite: 'off',
    group: true,
    prv: false,
    lock: 'off'
};

const questions = [
    { question: "ما اسم الشخصية الرئيسية في One Piece؟", answers: ['لوفي'] },
    { question: "من هو الـ Hokage السابع في Naruto؟", answers: ['ناروتو'] },
    { question: "ما اسم الكوكب الذي تدور فيه أحداث Dragon Ball؟", answers: ['الأرض'] },
    { question: "ما اسم سيف ايتشيغو في Bleach؟", answers: ['زانغيتسو'] },
    { question: "ما اسم الشخصية الرئيسية في Hunter x Hunter؟", answers: ['غون'] },
    { question: "من هو صاحب السيف في Demon Slayer؟", answers: ['تانجيرو'] },
    { question: "من هو قائد فرقة الصيادين في Attack on Titan؟", answers: ['ليفاي'] },
    { question: "من هو صاحب الـ Death Note؟", answers: ['لايت'] },
    { question: "ما اسم أقوى ساحر في Jujutsu Kaisen؟", answers: ['غوجو'] },
    { question: "ما اسم المنظمة التي ينتمي لها إيتاشي؟", answers: ['أكاتسكي'] },
    { question: "ما اسم الوحش الذي بداخل ناروتو؟", answers: ['كيوبي'] },
    { question: "من هي زوجة ناروتو؟", answers: ['هيناتا'] },
    { question: "ما اسم قرية الورق في ناروتو؟", answers: ['كونوها'] },
    { question: "من هو الأخ الأكبر لساسكي؟", answers: ['إيتاشي'] },
    { question: "ما اسم تقنية ناروتو الشهيرة؟", answers: ['راسينغان'] },
    { question: "ما اسم تقنية ساسكي المميزة؟", answers: ['تشيدوري'] },
    { question: "ما اسم والد غوكو في دراغون بول؟", answers: ['باردوك'] },
    { question: "من هو أمير الساياجين في دراغون بول؟", answers: ['فيجيتا'] },
    { question: "ما اسم ابن غوكو الأكبر؟", answers: ['غوهان'] },
    { question: "من هو الشرير الذي دمر كوكب فيجيتا؟", answers: ['فريزا'] },
    { question: "ما اسم زوجة غوكو؟", answers: ['تشيتشي'] },
    { question: "من هو معلم غوكو الأول؟", answers: ['ماستر روشي'] },
    { question: "من هي أقوى امرأة في دراغون بول؟", answers: ['أندرويد 18'] },
    { question: "ما اسم التحول الأقوى للساياجين؟", answers: ['سوبر ساياجين'] },
    { question: "من هو خالق الأندرويدز في دراغون بول؟", answers: ['دكتور غيرو'] }
];

// الجلسات النشطة والنقاط
const activeGames = new Map();
const scores = new Map();

export default {
    NovaUltra,
    async execute({ sock, msg, args }) {
        try {
            const chatId = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const command = args[0]?.toLowerCase();

            // عرض النتائج
            if (command === 'نتائج') {
                const groupScores = scores.get(chatId) || new Map();
                if (groupScores.size === 0) {
                    await sock.sendMessage(chatId, { text: '┇✨ لا توجد نتائج بعد ✨┇' });
                    return;
                }

                let results = '┇📊 نتائج مسابقة الأنمي 📊┇\n\n';
                const sorted = Array.from(groupScores.entries()).sort((a, b) => b[1] - a[1]);
                
                sorted.forEach(([player, points], index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔹';
                    results += `${medal} @${player.split('@')[0]} : ${points} نقطة\n`;
                });

                await sock.sendMessage(chatId, { text: results, mentions: sorted.map(s => s[0]) });
                return;
            }

            // إيقاف الفعالية
            if (command === 'وقف') {
                if (activeGames.has(chatId)) {
                    const game = activeGames.get(chatId);
                    if (game.listener) sock.ev.off('messages.upsert', game.listener);
                    activeGames.delete(chatId);
                    
                    await sock.sendMessage(chatId, { text: '┇⏸️ تم إيقاف الفعالية ⏸️┇' });
                }
                return;
            }

            if (activeGames.has(chatId)) {
                await sock.sendMessage(chatId, { text: '┇⚠️ الفعالية قائمة بالفعل ⚠️┇\n┇استخدم .انمي وقف للإيقاف┇' });
                return;
            }

            if (!scores.has(chatId)) scores.set(chatId, new Map());

            let currentQuestion = questions[Math.floor(Math.random() * questions.length)];
            let answered = false;

            // إرسال السؤال لمرة واحدة فقط
            await sock.sendMessage(chatId, { text: `┇🎌 سؤال الأنمي 🎌┇\n\n❓ ${currentQuestion.question}\n┇جاوب لتجمع النقاط┇` });

            const answerHandler = async ({ messages }) => {
                const newMsg = messages[0];
                if (!newMsg.message || newMsg.key.remoteJid !== chatId) return;
                if (!currentQuestion || answered) return;

                const answer = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text || '';
                const trimmed = answer.trim();
                if (!trimmed || trimmed.startsWith('.')) return;

                const responder = newMsg.key.participant || newMsg.key.remoteJid;
                const isCorrect = currentQuestion.answers.some(a => trimmed === a);

                if (isCorrect) {
                    answered = true;
                    const groupScores = scores.get(chatId);
                    const currentPoints = groupScores.get(responder) || 0;
                    groupScores.set(responder, currentPoints + 1);

                    await sock.sendMessage(chatId, {
                        text: `✅ @${responder.split('@')[0]} إجابة صحيحة!\n┇لديه الآن ${groupScores.get(responder)} نقاط┇`,
                        mentions: [responder]
                    });

                    if (groupScores.get(responder) >= 30) {
                        await sock.sendMessage(chatId, {
                            text: `🏆 @${responder.split('@')[0]} فاز بالفعالية! 🏆`,
                            mentions: [responder]
                        });
                        sock.ev.off('messages.upsert', answerHandler);
                        activeGames.delete(chatId);
                    }
                }
            };

            sock.ev.on('messages.upsert', answerHandler);
            activeGames.set(chatId, { currentQuestion, answered, listener: answerHandler });

        } catch (error) {
            console.error('❌ خطأ:', error);
        }
    }
};