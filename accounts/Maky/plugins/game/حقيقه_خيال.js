// plugins/حقيقه-خيال.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ النقاط
const pointsFile = path.join(__dirname, '../nova/data/points.json');

// دوال مساعدة للتعامل مع النقاط
function loadPoints() {
    try {
        if (fs.existsSync(pointsFile)) {
            return JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
        }
        return {};
    } catch {
        return {};
    }
}

function savePoints(points) {
    const dir = path.dirname(pointsFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2), 'utf8');
}

// دالة استخراج الرقم من المعرف
function extractNumber(jid) {
    return jid.split('@')[0];
}

export const NovaUltra = {
    command: "حقيقه خيال",
    description: "فعالية حقيقة أم خيال - جاوب بسرعة على صحة المعلومة",
    category: "فعاليات",
    elite: "off",
    group: true,
    prv: false,
    lock: "off"
};

async function execute({ sock, msg }) {
    const groupJid = msg.key.remoteJid;
    
    // التأكد أن الأمر في مجموعة
    if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(groupJid, {
            text: '*❌ هـذا الأمـر يعـمـل فـي القـروبـات فقـط.*'
        }, { quoted: msg });
    }

    const questions = [
        { statement: "🍥 ناروتو هو ابن الهوكاجي الرابع.", answer: "حقيقة" },
        { statement: "🧊 ميكاسا من عائلة تايتشي.", answer: "خيال" },
        { statement: "👒 لوفي حلمه أن يصبح ملك القراصنة.", answer: "حقيقة" },
        { statement: "⚡ كيلوا يكره الشوكولاتة.", answer: "خيال" },
        { statement: "🔮 إيتاتشي قتل عشيرته لأجل المال.", answer: "خيال" },
        { statement: "💀 لايت يملك مذكرة الموت.", answer: "حقيقة" },
        { statement: "🎮 غوكو من كوكب نيميك.", answer: "خيال" },
        { statement: "🌊 تانجيرو فقد عائلته بسبب الشياطين.", answer: "حقيقة" },
        { statement: "🌀 إيرين انضم للإستطلاع بسبب ميكاسا.", answer: "خيال" },
        { statement: "🔥 ساسكي واجه أوروتشيمارو في الجزء الأول.", answer: "حقيقة" }
    ];

    const selected = questions[Math.floor(Math.random() * questions.length)];
    const correctAnswer = selected.answer.toLowerCase();
    let isAnswered = false;
    let listenerHandler = null;

    const message = `*فـعـالـيـة الـيـوم : ˼‏🌀˹*\n*‏⎔ ٠ ┈─ ━╼ • ◞🧠◜ • ╾━ ─┈‏ ٠ ⎔*\n\n` +
        `*┃╻📝╹↵ اسـم الفـعـالـيـة ↯*\n*⧉┋※〔 حـقـيـقـة أم خـيـال 〕※*\n\n` +
        `*┃╻🌟╹↵ الـسـؤال ↯*\n*⧉┋※〔 ${selected.statement} 〕※*\n\n` +
        `*┃╻⏳╹↵ لـديـكـم 30 ثـانـيـة ↯*\n*‏⎔ ٠ ┈─ ━╼ • ◞🧠◜ • ╾━ ─┈‏ ٠ ⎔*\n` +
        `*٭ فعـالـيات بـوت لاگ ٭*\n*٭𝐺𝐴𝑀𝐸𝑆 𝓑𝓞𝓞𝓣. ALI . (⚡) ٭*`;

    await sock.sendMessage(groupJid, { text: message }, { quoted: msg });

    // مستمع الإجابات
    listenerHandler = async (event) => {
        if (isAnswered) return;
        
        const m = event.messages[0];
        if (!m.message || m.key.remoteJid !== groupJid) return;
        
        // الحصول على النص
        const body = m.message?.conversation?.toLowerCase()?.trim() ||
                    m.message?.extendedTextMessage?.text?.toLowerCase()?.trim();
        if (!body) return;

        if (body === correctAnswer) {
            isAnswered = true;
            sock.ev.off('messages.upsert', listenerHandler);

            const sender = m.key.participant || m.key.remoteJid;
            const number = extractNumber(sender);
            const pointsData = loadPoints();

            pointsData[number] = (pointsData[number] || 0) + 10;
            savePoints(pointsData);

            await sock.sendMessage(groupJid, {
                text: `*⧉┋٭ انـتـهـت الـفـعالـية ٭*\n\n` +
                    `*┃╻💐╹↵ الـفـائـز ↯*\n*❐ ↵「 @${number} 」*\n` +
                    `*┃╻🪻╹↵الإجـابـة ↯*\n*❐ ↵「 ${selected.answer} 」*\n\n` +
                    `*تـم مـنـحـه الـنـقـاط* 🍁🪺`,
                mentions: [sender]
            }, { quoted: m });
        }
    };

    sock.ev.on('messages.upsert', listenerHandler);

    // وقت انتهاء الفعالية (30 ثانية)
    setTimeout(async () => {
        sock.ev.off('messages.upsert', listenerHandler);
        if (!isAnswered) {
            await sock.sendMessage(groupJid, {
                text: `*⧉┋٭ انـتـهـت الـفـعالـية ٭*\n\n*❐ ↵ لم يجب أحد بشكل صحيح.\n┃╻🪻╹↵الإجـابـة ↯*\n*❐ ↵「 ${selected.answer} 」*`
            }, { quoted: msg });
        }
    }, 30000);
}

export default { NovaUltra, execute };