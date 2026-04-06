import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const NovaUltra = {
    command: 'ملصق',
    description: 'تحويل الصور إلى ملصقات باستخدام FFmpeg',
    group: true,
    prv: false,
    category: 'tools'
};

export default {
    NovaUltra,
    async execute({ sock, msg }) {
        const chatId = msg.key.remoteJid;

        try {
            // التحقق من وجود صورة (سواء مباشرة أو بالرد)
            const imageMessage = msg.message?.imageMessage || 
                                 msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

            if (!imageMessage) {
                return await sock.sendMessage(chatId, { 
                    text: '⚠️ يرجى الرد على صورة أو إرسال صورة مع كلمة *ملصق*.' 
                }, { quoted: msg });
            }

            // تحميل الميديا
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (buffer.length === 0) throw new Error("Buffer is empty");

            // مسارات الملفات المؤقتة
            const inputPath = path.join(process.cwd(), `temp_${Date.now()}.jpg`);
            const outputPath = path.join(process.cwd(), `temp_${Date.now()}.webp`);
            fs.writeFileSync(inputPath, buffer);

            // أمر FFmpeg للتحويل إلى WebP
            const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -quality 100 -compression_level 6 -qscale 50 ${outputPath}`;

            exec(ffmpegCmd, async (error) => {
                if (error) {
                    console.error('FFmpeg error:', error);
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    return await sock.sendMessage(chatId, { text: '❌ خطأ: تأكد من تثبيت ffmpeg على جهازك.' }, { quoted: msg });
                }

                const webpBuffer = fs.readFileSync(outputPath);
                await sock.sendMessage(chatId, { sticker: webpBuffer }, { quoted: msg });

                // تنظيف الملفات المؤقتة
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(chatId, { text: '❌ حدث خطأ أثناء معالجة الصورة.' }, { quoted: msg });
        }
    }
};