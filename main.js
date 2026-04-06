import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidNormalizedUser } from '@whiskeysockets/baileys';
import fs from 'fs-extra';
import pino from 'pino';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath, pathToFileURL } from 'url';
import crypto from 'crypto';
import os from 'os';
import delay from 'delay';

// --- المكتبات الجديدة لدعم الموقع ---
import express from 'express';
import cors from 'cors';

// استيراد أدوات الحسابات (تأكد من وجود الملف في مجلدك)
import { ensureAccountFiles } from './accounts/accountUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// الإعدادات الافتراضية
const IS_LOGIN_MODE = process.env.LOGIN_MODE === 'true';
const ACCOUNT_NAME = process.env.ACCOUNT_NAME || 'default';
const TARGET_FOLDER = path.join(__dirname, 'accounts', ACCOUNT_NAME);
const RESOURCE_DIR = IS_LOGIN_MODE ? path.resolve(__dirname, 'node_modules', 'default') : TARGET_FOLDER;

const sessionDir = path.join(__dirname, 'ملف_الاتصال');
const passwordFile = path.join(sessionDir, 'Password.txt'); 
const SECRET_KEY = crypto.createHash('sha256').update('jnd_secure_session_v1').digest();

// --- نظام التشفير والبصمة الرقمية ---
function encryptText(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
  } catch (e) { return null; }
}

function getSystemFingerprint() {
    try {
        const sysData = `${os.platform()}_${os.arch()}_${os.userInfo().username}`;
        return crypto.createHash('md5').update(sysData).digest('hex');
    } catch (e) { return 'fallback_' + os.arch(); }
}

// --- الدالة الأساسية لتشغيل البوت ---
export async function startBot() {
  try {
    // 1. تحميل الإعدادات (Config)
    const configPath = pathToFileURL(path.join(RESOURCE_DIR, 'nova', 'config.js')).href;
    const configModule = await import(configPath);
    const config = configModule.default;

    // 2. تحميل معالجات الرسائل والملحقات
    const msgsModule = await import(pathToFileURL(path.join(RESOURCE_DIR, 'handlers', 'messages.js')).href);
    const { handleMessages, initializePlugins } = msgsModule;

    // 3. إعداد الجلسة والاتصال
    await fs.ensureDir(sessionDir);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      version,
      printQRInTerminal: false,
      browser: ['Ubuntu', 'Chrome', '20.0.0'],
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: true
    });

    // ==========================================
    // 🌐 نـظـام خـادم الـربـط (API Gateway)
    // ==========================================
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.post('/pair', async (req, res) => {
        let { number } = req.body;
        if (!number) return res.status(400).json({ error: 'يرجى إرسال الرقم' });

        try {
            // تحويل الرقم لنص وتنظيفه (حل مشكلة replace)
            const phoneNumber = String(number).replace(/[^0-9]/g, '');
            
            // طلب كود الربط من Baileys
            const code = await sock.requestPairingCode(phoneNumber, "ANASTASIA");
            
            console.log(chalk.black.bgYellow(`\n 🌐 طلب كود للموقع للرقم: ${phoneNumber} | الكود: ${code} \n`));
            
            // حفظ بيانات الأمان المشفرة
            const securityData = JSON.stringify({ password: "ANASTASIA", fingerprint: getSystemFingerprint() });
            await fs.writeFile(passwordFile, encryptText(securityData));

            res.json({ code });
        } catch (err) {
            console.error('Pairing error:', err);
            res.status(500).json({ error: 'فشل في توليد الكود' });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(chalk.green(`🌐 بوابة الموقع تعمل الآن على المنفذ ${PORT}`));
    });
    // ==========================================

    // إدارة أحداث الاتصال
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        console.log(chalk.green.bold(`✅ تم الاتصال بنجاح! [${ACCOUNT_NAME}]`));
        if(initializePlugins) await initializePlugins('FF6BFF');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== DisconnectReason.loggedOut) {
            console.log(chalk.yellow("🔄 انقطع الاتصال.. جارٍ إعادة المحاولة..."));
            setTimeout(startBot, 5000);
        }
      }
    });

    // استقبال الرسائل
    sock.ev.on('messages.upsert', async (m) => {
        if (handleMessages) await handleMessages(sock, m);
    });

    // حفظ بيانات الاعتماد
    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error(chalk.red('❌ فشل التشغيل الحرجي:'), err.message);
    setTimeout(startBot, 10000);
  }
}

// انطلاق البوت
startBot();
