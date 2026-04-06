// plugins/انذار.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ملف حفظ الإنذارات
const warningsFile = path.join(__dirname, '../nova/data/warnings.json');

// التأكد من وجود المجلد والملف
const dataDir = path.join(__dirname, '../nova/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(warningsFile)) fs.writeFileSync(warningsFile, JSON.stringify({}));

// دوال مساعدة
function loadWarnings() {
    try {
        return JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2), 'utf8');
}

// رسائل حسب عدد الإنذارات
function getWarningMessage(number, target, current, remaining) {
    const messages = {
        1: `*╻⚠️╹↵ الإنـذار الأول ╹↵*\n\n*@${target}*\n\n*╻📝╹↵ عدد الإنذارات: ${current}/4*\n*╻⏳╹↵ متبقي: ${remaining} إنذار قبل الطرد.*\n\n*╻💀╹↵ تنبيه: عند وصول 4 إنذارات سيتم الطرد.*`,
        
        2: `*╻⚠️⚠️╹↵ الإنـذار الثـاني ╹↵*\n\n*@${target}*\n\n*╻📝╹↵ عدد الإنذارات: ${current}/4*\n*╻⏳╹↵ متبقي: ${remaining} إنذار قبل الطرد.*\n\n*╻💀╹↵ هذا إنذار نهائي، احذر!*`,
        
        3: `*╻⚠️⚠️⚠️╹↵ الإنـذار الثـالـث ╹↵*\n\n*@${target}*\n\n*╻📝╹↵ عدد الإنذارات: ${current}/4*\n*╻⏳╹↵ متبقي: ${remaining} إنذار أخير.*\n\n*╻💀💀╹↵ إنذار أخير! المرة القادمة سيتم الطرد!*`,
        
        4: `*╻⚠️⚠️⚠️⚠️╹↵ الإنـذار الـرابـع ╹↵*\n\n*@${target}*\n\n*╻📝╹↵ عدد الإنذارات: ${current}/4*\n*╻💀╹↵ تم الوصول للحد الأقصى.*\n\n*╻🔥╹↵ جاري طرد العضو...*`
    };
    
    return messages[number] || messages[1];
}

export const NovaUltra = {
    command: "انذار",
    description: "إعطاء إنذار لعضو (4 إنذارات = طرد)",
    category: "الادارة",
    elite: "off",
    group: true,
    prv: false,
    lock: "off",
    admin: true
};

async function execute({ sock, msg }) {
    const groupId = msg.key.remoteJid;

    // التأكد أن الأمر في مجموعة
    if (!groupId.endsWith('@g.us')) {
        return await sock.sendMessage(groupId, {
            text: '*╻❌╹↵ هذا الأمر يعمل فقط في المجموعات.*'
        }, { quoted: msg });
    }

    // الحصول على الشخص المطلوب (الرد على رسالة أو منشن)
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let targetJid = quoted?.participant;
    
    // إذا لم يكن هناك رد، نبحث عن منشن
    if (!targetJid) {
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJids && mentionedJids.length > 0) {
            targetJid = mentionedJids[0];
        }
    }

    if (!targetJid) {
        return await sock.sendMessage(groupId, {
            text: '*╻❌╹↵ رد على رسالة الشخص أو قم بمنشنه.*\n*مثال:* `.انذار @الشخص`'
        }, { quoted: msg });
    }

    // منع إنذار البوت نفسه
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    if (targetJid === botJid) {
        return await sock.sendMessage(groupId, {
            text: '*╻😂╹↵ لا يمكنك إنذار البوت نفسه!*'
        }, { quoted: msg });
    }

    const targetNumber = targetJid.split('@')[0];
    
    // تحميل بيانات الإنذارات
    const warnings = loadWarnings();
    const groupWarnings = warnings[groupId] || {};
    const currentWarnings = groupWarnings[targetJid] || 0;
    const newWarnings = currentWarnings + 1;

    if (newWarnings >= 4) {
        // إرسال رسالة الإنذار الرابع
        const warningMsg = getWarningMessage(4, targetNumber, newWarnings, 0);
        await sock.sendMessage(groupId, {
            text: warningMsg,
            mentions: [targetJid]
        }, { quoted: msg });
        
        // طرد العضو
        try {
            await sock.groupParticipantsUpdate(groupId, [targetJid], 'remove');
            
            // حذف الإنذارات بعد الطرد
            delete groupWarnings[targetJid];
            warnings[groupId] = groupWarnings;
            saveWarnings(warnings);
            
            await sock.sendMessage(groupId, {
                text: `*╻✅╹↵ تـم طـرد الـعـضـو ╻🔥╹↵*\n\n*@${targetNumber}*\n\n*╻❌╹↵ السبب: تجاوز 4 إنذارات.*`,
                mentions: [targetJid]
            }, { quoted: msg });
            
            // تفاعل
            await sock.sendMessage(groupId, {
                react: { text: '🔨', key: msg.key }
            });
            
        } catch (err) {
            console.error('خطأ في الطرد:', err);
            await sock.sendMessage(groupId, {
                text: '*╻❌╹↵ فشل طرد العضو. تأكد أن البوت مشرف.*'
            }, { quoted: msg });
        }
        
    } else {
        // تحديث الإنذارات
        groupWarnings[targetJid] = newWarnings;
        warnings[groupId] = groupWarnings;
        saveWarnings(warnings);
        
        const remaining = 4 - newWarnings;
        
        // إرسال رسالة حسب عدد الإنذار
        const warningMsg = getWarningMessage(newWarnings, targetNumber, newWarnings, remaining);
        await sock.sendMessage(groupId, {
            text: warningMsg,
            mentions: [targetJid]
        }, { quoted: msg });
        
        // تفاعل حسب عدد الإنذارات
        const reactions = {
            1: '⚠️',
            2: '⚠️⚠️',
            3: '⚠️⚠️⚠️'
        };
        await sock.sendMessage(groupId, {
            react: { text: reactions[newWarnings] || '⚠️', key: msg.key }
        });
    }
}

export default { NovaUltra, execute };