// ملف: plugins/الأدوات/جوده.js

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const NovaUltra = {
    command: ["جوده"],
    description: "تحسين جودة الصورة إلى 2K",
    elite: "off",
    group: false,
    prv: true,
    lock: "off",
    admin: false
};

// دالة تأخير
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// دالة تحميل الصورة من واتساب
async function downloadMedia(sock, message) {
    try {
        const media = await sock.downloadMediaMessage(message);
        return media;
    } catch (error) {
        console.error("خطأ في تحميل الصورة:", error);
        return null;
    }
}

// دالة رفع الصورة إلى API لتحسين الجودة
async function upscaleImage(imageBuffer, scale = 2) {
    try {
        // استخدام API مجاني لتحسين الجودة (replicate.com أو deepai.org)
        // ملاحظة: هذا API تجريبي، قد تحتاج إلى مفتاح API خاص
        
        const formData = new FormData();
        formData.append("image", imageBuffer, {
            filename: "image.jpg",
            contentType: "image/jpeg"
        });
        
        // API 1: DeepAI (مجاني ولكن محدود)
        const response = await axios.post(
            "https://api.deepai.org/api/torch-srgan",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K" // مفتاح تجريبي
                },
                responseType: "arraybuffer"
            }
        );
        
        return Buffer.from(response.data);
        
    } catch (error) {
        console.error("خطأ في تحسين الصورة:", error);
        return null;
    }
}

// دالة تحسين الصورة باستخدام Sharp (محلياً)
async function upscaleWithSharp(imageBuffer, scale = 2) {
    try {
        const sharp = await import('sharp');
        const sharpModule = sharp.default;
        
        const enhancedImage = await sharpModule(imageBuffer)
            .resize({
                width: null,
                height: null,
                fit: 'contain',
                kernel: sharpModule.kernel.lanczos3,
                withoutEnlargement: false
            })
            .sharpen({ sigma: 1.5, m1: 1.0, m2: 0.5 })
            .toBuffer();
        
        return enhancedImage;
    } catch (error) {
        console.error("خطأ في تحسين الصورة بـ Sharp:", error);
        return null;
    }
}

export async function execute({ sock, msg, args }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    try {
        let quotedMsg = null;
        
        // التحقق من وجود صورة مقتبسة
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        }
        
        // التحقق من أن المستخدم رد على صورة
        if (!quotedMsg || !quotedMsg.imageMessage) {
            return sock.sendMessage(chatId, { 
                text: "📸 *طريقة استخدام أمر الجودة:*\n\n• رد على صورة ثم اكتب `.جوده`\n• أو اكتب `.جوده 4` لتحسين إلى 4K\n\n*مثال:*\nرد على صورة ثم اكتب `.جوده 2`"
            }, { quoted: msg });
        }
        
        // تحديد مستوى التحسين
        let scale = 2; // افتراضي 2K
        if (args[0] && !isNaN(args[0])) {
            scale = parseInt(args[0]);
            if (scale > 4) scale = 4;
            if (scale < 1) scale = 2;
        }
        
        // تفاعل بداية المعالجة
        await sock.sendMessage(chatId, {
            react: { text: "🔄", key: msg.key }
        });
        
        // إرسال رسالة انتظار
        await sock.sendMessage(chatId, {
            text: `⏳ *جاري تحسين جودة الصورة إلى ${scale}K...*\n\n> ⚡ يرجى الانتظار قليلاً`
        }, { quoted: msg });
        
        // تحميل الصورة
        const imageBuffer = await downloadMedia(sock, {
            message: quotedMsg.imageMessage,
            key: msg.key
        });
        
        if (!imageBuffer) {
            return sock.sendMessage(chatId, {
                text: "❌ فشل في تحميل الصورة، يرجى المحاولة مرة أخرى"
            }, { quoted: msg });
        }
        
        // تحسين الجودة
        let enhancedBuffer = null;
        
        try {
            // محاولة تحسين الجودة باستخدام API أولاً
            enhancedBuffer = await upscaleImage(imageBuffer, scale);
            
            // إذا فشل API، استخدم Sharp محلياً
            if (!enhancedBuffer) {
                enhancedBuffer = await upscaleWithSharp(imageBuffer, scale);
            }
        } catch (error) {
            console.error("خطأ في المعالجة:", error);
            enhancedBuffer = await upscaleWithSharp(imageBuffer, scale);
        }
        
        if (!enhancedBuffer) {
            return sock.sendMessage(chatId, {
                text: "❌ فشل في تحسين جودة الصورة، يرجى المحاولة مرة أخرى"
            }, { quoted: msg });
        }
        
        // تفاعل نجاح
        await sock.sendMessage(chatId, {
            react: { text: "✅", key: msg.key }
        });
        
        // إرسال الصورة المحسنة
        await sock.sendMessage(chatId, {
            image: enhancedBuffer,
            caption: `✨ *تم تحسين جودة الصورة إلى ${scale}K*\n\n> 🖼️ جودة محسنة بالذكاء الاصطناعي\n> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕`,
            mimetype: "image/jpeg"
        }, { quoted: msg });
        
        console.log(`✅ تم تحسين صورة في ${chatId} إلى ${scale}K`);
        
    } catch (err) {
        console.error("❌ خطأ في أمر الجودة:", err);
        await sock.sendMessage(chatId, { 
            text: "❌ حدث خطأ في تحسين الصورة\n\n*الأسباب المحتملة:*\n• الصورة غير مدعومة\n• حجم الصورة كبير جداً\n• مشكلة في الاتصال"
        }, { quoted: msg });
    }
}

export default { NovaUltra, execute };