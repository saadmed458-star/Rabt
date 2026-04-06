// plugins/النظام/d.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تخزين الجلسات النشطة
const activeRequests = new Map();

export const NovaUltra = {
  command: "d",
  description: "إرسال استمارة انضمام للمجموعة",
  elite: "on",        // فقط للنخبة
  group: true,
  prv: false,
  lock: "off"
};

function getFormText(username, targetName) {
  return `
*‏❖══════ •『📝』• ══════❖*

*▸ الــقــب :  كــرولــو ┇  ⤹*

*▸ مــن طــرف : ${targetName}┇  ⤹*

*❃━═━═✦•〘•📌•〙•✦═━═━❃*

*⏤͟͟͞͞  أنــا عــضــو جــديــد فــي الــمــجــمــوعــة*
*الــبــوت الــذي أســتــخــدمــه أمــن و*
*لا تــوجــد أي مــخــاطــر فــي*
*بــوتــي مــن فــوائــده يــســتــطــيــع زيــادة الــتــفــاعــل وعــمــل فــعــالــيــات الــخخ*

*‏❖══════ •『 💐 』• ══════❖*

> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕
`;
}

function getQuestionText() {
  return `
*‏❖══════ •『❓』• ══════❖*

*❍↵ هــل تــقــبــلــون أن أنــضــم لــكــم ؟*

*▸ نــعــم* 
*▸ لا*

*‏❖══════ •『 💐 』• ══════❖*

> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕
`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة للتحقق من أن المستخدم مشرف
async function isAdmin(sock, chatId, userId) {
  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    const participant = groupMetadata.participants.find(p => p.id === userId);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch (err) {
    console.error("خطأ في التحقق من المشرف:", err);
    return false;
  }
}

async function execute({ sock, msg, args }) {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderName = msg.pushName || sender.split('@')[0];
  
  // الحصول على اسم الطرف (اللي كتب d)
  const targetName = args[0] || senderName;
  
  // مسار الصورة
  const imagePath = "/storage/emulated/0/.bot/bot/accounts/Maky/nova/mor.jpg";
  
  // التحقق من وجود جلسة نشطة للمجموعة
  if (activeRequests.has(chatId)) {
    return await sock.sendMessage(chatId, {
      text: "*أيــش تــبــي مــو شــايف الــزلــمــه يــســتــخــدم الأمــر*"
    }, { quoted: msg });
  }
  
  // إنشاء جلسة جديدة
  const requestId = Date.now().toString();
  const requestData = {
    id: requestId,
    targetName: targetName,
    sender: sender,
    active: true,
    timeout: null
  };
  
  activeRequests.set(chatId, requestData);
  
  // إرسال الاستمارة مع الصورة (الرسالة الأولى)
  const formText = getFormText(senderName, targetName);
  
  let sentMessage;
  if (fs.existsSync(imagePath)) {
    sentMessage = await sock.sendMessage(chatId, {
      image: fs.readFileSync(imagePath),
      caption: formText
    }, { quoted: msg });
  } else {
    sentMessage = await sock.sendMessage(chatId, {
      text: formText
    }, { quoted: msg });
    console.log("⚠️ الصورة غير موجودة في:", imagePath);
  }
  
  // إضافة تفاعل
  await sock.sendMessage(chatId, {
    react: { text: '📝', key: msg.key }
  });
  
  // انتظار 5 ثواني
  await sleep(5000);
  
  // إرسال رسالة السؤال (الرسالة الثانية)
  const questionText = getQuestionText();
  await sock.sendMessage(chatId, {
    text: questionText
  }, { quoted: msg });
  
  // تعيين مهلة 60 ثانية للرد
  const timeout = setTimeout(async () => {
    const currentRequest = activeRequests.get(chatId);
    if (currentRequest && currentRequest.id === requestId) {
      activeRequests.delete(chatId);
      // لا نرسل أي رسالة، فقط ننتهي
    }
  }, 60000);
  
  requestData.timeout = timeout;
  activeRequests.set(chatId, requestData);
  
  // مستمع الردود
  const responseListener = async (event) => {
    const messages = event.messages;
    for (const m of messages) {
      if (m.key.remoteJid !== chatId) continue;
      if (m.key.fromMe) continue;
      
      const currentRequest = activeRequests.get(chatId);
      if (!currentRequest || !currentRequest.active) return;
      if (currentRequest.id !== requestId) return;
      
      const responseText = m.message?.conversation?.toLowerCase()?.trim() || 
                           m.message?.extendedTextMessage?.text?.toLowerCase()?.trim() || '';
      
      // التحقق من أن المرسل مشرف (لـ نعم/لا فقط)
      const isUserAdmin = await isAdmin(sock, chatId, m.key.participant || m.key.remoteJid);
      
      if (responseText === "نعم") {
        // التحقق من أن المستخدم مشرف
        if (!isUserAdmin) {
          await sock.sendMessage(chatId, {
            text: "*شــكــرا لــك لاكــن أنــت لــســت مــشــرف لــذالــك لا يــحــق لــك أن تــقــرر قــبــولــي 🙃*"
          }, { quoted: m });
          return;
        }
        
        // إزالة المستمع والمهلة
        clearTimeout(currentRequest.timeout);
        activeRequests.delete(chatId);
        
        // رسالة الشكر
        await sock.sendMessage(chatId, {
          text: `*‏❖══════ •『✨』• ══════❖*\n\n*❍↵ شــكــراً لــقــبــولــكــم*\n\n*▸ ${currentRequest.targetName}*\n\n*‏❖══════ •『 💐 』• ══════❖*`
        });
        
        await sock.sendMessage(chatId, {
          react: { text: '✅', key: m.key }
        });
        
        // إزالة المستمع
        sock.ev.off("messages.upsert", responseListener);
        
      } else if (responseText === "لا") {
        // التحقق من أن المستخدم مشرف
        if (!isUserAdmin) {
          await sock.sendMessage(chatId, {
            text: "*أنــت لــســت مــشــرف لا يــحــق لــك أن تــقــرر 🫦*"
          }, { quoted: m });
          return;
        }
        
        // إزالة المستمع والمهلة
        clearTimeout(currentRequest.timeout);
        activeRequests.delete(chatId);
        
        // رسالة الرفض
        await sock.sendMessage(chatId, {
          text: `*‏❖══════ •『❌』• ══════❖*\n\n*❍↵ تــم رفــض طــلــب الانــضــمــام*\n\n*▸ ${currentRequest.targetName}*\n\n*❍↵ نــتــمــنــى لــك الــتــوفــيــق*\n\n*‏❖══════ •『 💐 』• ══════❖*`
        });
        
        await sock.sendMessage(chatId, {
          react: { text: '❌', key: m.key }
        });
        
        // البوت يغادر المجموعة
        await sock.sendMessage(chatId, {
          text: "*🚪 البوت سيغادر المجموعة...*"
        });
        
        // مغادرة المجموعة
        await sock.groupParticipantsUpdate(chatId, [sock.user.id.split(':')[0] + '@s.whatsapp.net'], 'remove');
        
        // إزالة المستمع
        sock.ev.off("messages.upsert", responseListener);
        
      } else if (responseText === "d" || responseText === "اوامر") {
        // تجاهل الأوامر
        return;
      }
    }
  };
  
  sock.ev.on("messages.upsert", responseListener);
}

export default { NovaUltra, execute };