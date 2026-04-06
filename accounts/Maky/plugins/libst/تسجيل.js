import fs from "fs";

export const NovaUltra = {
    command: ["تسجيل","حسابي","ترقية","خروج"],
    description: "نظام حساب متكامل",
    group: true,
    prv: true
};

const FILE = "./users.json";

let users = {};
if (fs.existsSync(FILE)) {
    users = JSON.parse(fs.readFileSync(FILE));
}

function save() {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

// تأكيد الحذف
const confirmDelete = new Map();

export default {
    NovaUltra,
    async execute({ sock, msg, args }) {

        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // ===============================
        // 🛠️ معرفة هل مشرف
        // ===============================
        let isAdmin = false;
        try {
            if (chatId.endsWith("@g.us")) {
                const metadata = await sock.groupMetadata(chatId);
                const participant = metadata.participants.find(p => p.id === sender);
                isAdmin = participant?.admin !== null;
            }
        } catch {}

        // ===============================
        // 📝 تسجيل
        // ===============================
        if (body.startsWith(".تسجيل")) {

            const name = args.join(" ");

            if (!name) {
                return sock.sendMessage(chatId, {
                    text:
`╭━━━〔 ⚠️ تنبيه 〕━━━╮
┃ ⟡ اكتب اسمك
┃ مثال: .تسجيل سعد
╰━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
            }

            if (users[sender]) {
                return sock.sendMessage(chatId, {
                    text:
`╭━━━〔 ⚠️ مسجل بالفعل 〕━━━╮
┃ ⟡ لديك حساب مسبق
╰━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
            }

            const role = isAdmin ? "مشرف 👑" : "مبتدئ 🐣";

            users[sender] = {
                name,
                role,
                points: 0,
                level: 1,
                registeredAt: new Date().toLocaleString()
            };

            save();

            let pp;
            try {
                pp = await sock.profilePictureUrl(sender, "image");
            } catch {
                pp = "https://i.ibb.co/3WZfG8M/user.png";
            }

            return sock.sendMessage(chatId, {
                image: { url: pp },
                caption:
`╭━━━〔 ✦ تسجيل جديد ✦ 〕━━━╮
┃ ⌬ مرحباً بك 👋
┣━━━〔 👤 بياناتك 〕━━━┫
┃ ⟡ الاسم : ${name}
┃ ⟡ الرتبة : ${role}
┃ ⟡ الآيدي : @${sender.split("@")[0]}
┣━━━〔 📊 معلوماتك 〕━━━┫
┃ ⟡ النقاط : 0
┃ ⟡ المستوى : 1
┣━━━〔 📅 التسجيل 〕━━━┫
┃ ⟡ ${users[sender].registeredAt}
╰━━━〔 ✦ أهلاً بك ✦ 〕━━━╯`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // ===============================
        // 👤 حسابي
        // ===============================
        if (body.startsWith(".حسابي")) {

            if (!users[sender]) {
                return sock.sendMessage(chatId, {
                    text: "❌ لم تسجل بعد\nاستخدم .تسجيل"
                }, { quoted: msg });
            }

            const user = users[sender];

            let pp;
            try {
                pp = await sock.profilePictureUrl(sender, "image");
            } catch {
                pp = "https://i.ibb.co/3WZfG8M/user.png";
            }

            return sock.sendMessage(chatId, {
                image: { url: pp },
                caption:
`╭━━━〔 👤 حسابك 〕━━━╮
┣━━━〔 📛 البيانات 〕━━━┫
┃ ⟡ الاسم : ${user.name}
┃ ⟡ الرتبة : ${user.role}
┃ ⟡ الآيدي : @${sender.split("@")[0]}
┣━━━〔 📊 الإحصائيات 〕━━━┫
┃ ⟡ النقاط : ${user.points}
┃ ⟡ المستوى : ${user.level}
┣━━━〔 📅 التسجيل 〕━━━┫
┃ ⟡ ${user.registeredAt}
╰━━━〔 ✦ بالتوفيق ✦ 〕━━━╯`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // ===============================
        // 🔥 ترقية
        // ===============================
        if (body.startsWith(".ترقية")) {

            if (!isAdmin) {
                return sock.sendMessage(chatId, {
                    text: "❌ هذا الأمر للمشرفين فقط"
                }, { quoted: msg });
            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned || !mentioned[0]) {
                return sock.sendMessage(chatId, {
                    text: "❌ اعمل منشن للشخص\nمثال: .ترقية @شخص"
                }, { quoted: msg });
            }

            const target = mentioned[0];

            if (!users[target]) {
                return sock.sendMessage(chatId, {
                    text: "❌ هذا الشخص غير مسجل"
                }, { quoted: msg });
            }

            const ranks = ["مبتدئ 🐣","محترف ⚔️","خبير 🔥","أسطورة 👑"];
            let currentIndex = ranks.indexOf(users[target].role);

            if (currentIndex === -1 || currentIndex >= ranks.length - 1) {
                return sock.sendMessage(chatId, {
                    text: "⚠️ لا يمكن ترقيته أكثر"
                }, { quoted: msg });
            }

            users[target].role = ranks[currentIndex + 1];
            save();

            return sock.sendMessage(chatId, {
                text:
`🏆 تم ترقية @${target.split("@")[0]}
⬆️ الرتبة الجديدة: ${users[target].role}`,
                mentions: [target]
            }, { quoted: msg });
        }

        // ===============================
        // 🚪 خروج (حذف الحساب)
        // ===============================
        if (body.startsWith(".خروج")) {

            if (!users[sender]) {
                return sock.sendMessage(chatId, {
                    text: "❌ ليس لديك حساب"
                }, { quoted: msg });
            }

            // تأكيد
            if (!confirmDelete.has(sender)) {
                confirmDelete.set(sender, true);

                setTimeout(() => confirmDelete.delete(sender), 15000);

                return sock.sendMessage(chatId, {
                    text:
`⚠️ هل أنت متأكد؟

اكتب .خروج مرة ثانية خلال 15 ثانية لحذف حسابك ❗`
                }, { quoted: msg });
            }

            // حذف
            delete users[sender];
            confirmDelete.delete(sender);
            save();

            return sock.sendMessage(chatId, {
                text: "✅ تم حذف حسابك بنجاح"
            }, { quoted: msg });
        }

    }
};