// plugins/الادوات/اموجي.js
import fetch from 'node-fetch';

const fetchJson = async (url) => {
    try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    } catch (err) {
        throw err;
    }
};

export const NovaUltra = {
    command: ["اموجي", "emojimix", "دمج"],
    description: "دمج إيموجيين مع بعض",
    category: "ادوات",
    elite: "off",
    group: true,
    prv: true,
    lock: "off"
};

async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const fullText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const text = fullText.replace(/^[^\s]+\s*/, '').trim();
    
    // التحقق من وجود إيموجي
    if (!text) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『🎨』• ══════❖*\n\n*❍↵ طــريــقــة الاســتــخــدام:*\n\n*▸ .اموجي 😎+🤑*\n\n*❍↵ يــجــب فــصــل الإيــمــوجــي بــعــلامة +*`
        }, { quoted: msg });
    }
    
    // التحقق من وجود +
    if (!text.includes('+')) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ يــجــب فــصــل الإيــمــوجــي بــعــلامة +*\n\n*مثال:* .اموجي 😎+🤑`
        }, { quoted: msg });
    }
    
    // استخراج الإيموجيين
    const [emoji, emoji2] = text.split('+');
    
    if (!emoji || !emoji2) {
        return await sock.sendMessage(chatId, {
            text: `*‏❖══════ •『⚠️』• ══════❖*\n\n*❍↵ يــجــب إدخــال إيــمــوجــيــيــن*\n\n*مثال:* .اموجي 😎+🤑`
        }, { quoted: msg });
    }
    
    await sock.sendMessage(chatId, {
        react: { text: '🎨', key: msg.key }
    });
    
    try {
        // جلب الإيموجي المدمج من API
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}_${encodeURIComponent(emoji2)}`;
        
        const result = await fetchJson(apiUrl);
        
        if (!result || !result.results || result.results.length === 0) {
            throw new Error("لا توجد نتيجة لهذا الدمج");
        }
        
        // الحصول على رابط الصورة
        const imageUrl = result.results[0].url;
        
        // تحميل الصورة
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.buffer();
        
        // إرسال الملصق
        await sock.sendMessage(chatId, {
            sticker: imageBuffer,
            mimetype: 'image/webp'
        }, { quoted: msg });
        
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: msg.key }
        });
        
    } catch (err) {
        console.error("❌ خطأ في دمج الإيموجي:", err);
        
        let errorMsg = `*‏❖══════ •『❌』• ══════❖*\n\n*❍↵ فــشــل دمــج الإيــمــوجــي*\n\n*▸ ${emoji} + ${emoji2}*\n\n*❍↵ تــأكــد مــن صــحــة الإيــمــوجــي*\n*❍↵ قــد لا يــوجــد نــتــيــجــة لــهــذا الــدمــج*`;
        
        await sock.sendMessage(chatId, { text: errorMsg }, { quoted: msg });
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
}

export default { NovaUltra, execute };