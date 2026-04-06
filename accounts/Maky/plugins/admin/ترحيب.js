// plugins/المجموعات/ترحيب.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار الصورة الثابتة
const FIXED_IMAGE_PATH = "/storage/emulated/0/bot/accounts/Maky/nova/fyr.jpg";

export const NovaUltra = {
    command: "ترحيب",
    description: "يرحب بعضو جديد بترحيب محفّز مع منشن ولقب متعدد الكلمات وصورة ثابتة",
    category: "ترحيب الاعضاء",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg, args }) {
    const groupJid = msg.key.remoteJid;

    // التأكد أن الأمر في مجموعة
    if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(groupJid, {
            text: '*╻❌╹↵ هذا الأمر يعمل فقط في القروبات.*'
        }, { quoted: msg });
    }

    // الحصول على النص والأوامر
    const fullText = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const argsArray = fullText.trim().split(' ').slice(1);
    
    // الحصول على الشخص الممنشن
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!mentionedJid || argsArray.length < 2) {
        return await sock.sendMessage(groupJid, {
            text: '*╻❌╹↵ اكتـب اللقـب قـبـل المـنـشـن.*\n*مثال:* `.ترحيب سابو معئ منشنة @123456`'
        }, { quoted: msg });
    }

    const userTag = mentionedJid.split('@')[0];

    // استخراج اللقب (كل الكلمات قبل المنشن)
    const mentionIndex = argsArray.findIndex(arg => arg.startsWith('@'));
    const titleParts = argsArray.slice(0, mentionIndex);
    const title = titleParts.join(' ');

    // النص الجديد للترحيب
    const welcomeMsg = `*『مـرحـبـاً بـك بـيـن اخـوتـك』*
✽ ━─╌ •⤣🪽⤤• ╌─━ ✽
*⧉✍︎ نـورت أهـلاً و سـهـلاً  أيــهـا الـعـضـو العـزيـز💫♥️*

*┇✍︎ نـحـن سـعـيـدون بإنـضـمـامـك إلـيـنـا و نـتـمـنـى مـنـك الـتـفـاعـل و الاحـتـرام وإضـافــة بـصـمـه رائـعـه لـلـقــروب🔥*
✽ ━─╌ •⤣🌙⤤• ╌─━ ✽
*⧉┇الـلـقـــــب🤵🏻‍♂↫ 『 ${title} 』*

*⧉┇الـمــنــشــن📝↫ 『 @${userTag} 』*

*✧ 〕 \`جروب الاعلانات اجباري تدخل\`*
*~〔 https://chat.whatsapp.com/H4O4TPcnhOC0dNvIx5j830?mode=gi_t〕~*
> *~ما تدخل = طرد~*
 
*✧ 〕 \`صـحـيـفـة الـمـمـلـكـة🪽\`*
https://chat.whatsapp.com/BloQYK7cGrhIT27BKGrAN9?mode=gi_t

⌬┇━──╌ •⤣🪽⤤• ╌──━┇⌬
*⧉┊تـــحـــيــات🔓 ↯*
> 『 𝐇.𝐊.𝐑 ⊰🪷⊱𝑩𝛩𝑻 🕸⃝⃕   』`;

    // استخدام الصورة الثابتة بدلاً من صورة البروفايل
    let imageBuffer;
    
    // التحقق من وجود الصورة في المسار المحدد
    if (fs.existsSync(FIXED_IMAGE_PATH)) {
        imageBuffer = fs.readFileSync(FIXED_IMAGE_PATH);
    } else {
        // إذا لم توجد الصورة، نبحث في مسار بديل
        const fallbackImage = path.join(__dirname, '../nova/media/default.jpg');
        if (fs.existsSync(fallbackImage)) {
            imageBuffer = fs.readFileSync(fallbackImage);
        } else {
            // إذا لم توجد أي صورة، نرسل نص فقط
            return await sock.sendMessage(groupJid, {
                text: welcomeMsg,
                mentions: [mentionedJid]
            }, { quoted: msg });
        }
    }

    // إرسال الصورة الثابتة مع الرسالة
    await sock.sendMessage(groupJid, {
        image: imageBuffer,
        caption: welcomeMsg,
        mentions: [mentionedJid]
    }, { quoted: msg });
    
    // تفاعل تأكيد
    await sock.sendMessage(groupJid, {
        react: { text: '✅', key: msg.key }
    });
}

export default { NovaUltra, execute };