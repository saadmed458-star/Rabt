import fs from "fs";

const DeveloperContact = {
  command: "المطور",
  description: "عرض جهة اتصال المطور",
  elite: "off",
  lock: "off",
  nova: "on"
};

async function execute({ sock, msg }) {
  const chatId = msg.key.remoteJid;
  
  const devNumber = "22230471912";
  const devName = "⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 🕸⃝⃕";
  const audioPath = "/storage/emulated/0/.bot/bot/accounts/Maky/nova/welcome.mp3";

  try {
    // إرسال جهة اتصال
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${devName}
TEL;waid=${devNumber}:+${devNumber}
END:VCARD`;

    await sock.sendMessage(chatId, {
      contacts: {
        displayName: devName,
        contacts: [{ vcard }]
      }
    }, { quoted: msg });
    
    // محاولة إرسال الصوت
    if (fs.existsSync(audioPath)) {
      const audioBuffer = fs.readFileSync(audioPath);
      
      // محاولة إرسال كـ voice note
      try {
        await sock.sendMessage(chatId, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      } catch (e) {
        // إذا فشل، جرب صيغة أخرى
        await sock.sendMessage(chatId, {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          ptt: true
        });
      }
    } else {
      // إرسال رسالة نصية بدلاً من الصوت
      await sock.sendMessage(chatId, {
        text: `🎤 *رسالة من المطور ${devName}*\n\nمرحباً بك! أنا المطور.\n📞 يمكنك التواصل معي عبر جهة الاتصال أعلاه.`
      });
    }
    
  } catch (err) {
    console.error("Error:", err);
  }
}

export default { DeveloperContact, execute };