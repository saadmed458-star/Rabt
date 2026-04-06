// plugins/النظام/menu.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { jidDecode } from "@whiskeysockets/baileys";
import { getPlugins } from "../../handlers/plugins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const activeMenuSessions = new Map();

const NovaUltra = {
  command: "اوامر",
  description: "قائمة الأوامر التفاعلية — Ultra Nova",
  elite: "off",
  lock: "off",
  nova: "on"
};

function decode(jid) {
  return (jidDecode(jid)?.user || jid.split("@")[0]) + "@s.whatsapp.net";
}

function getCommandStatusSuffix(plugin) {
  let suffix = "";
  const isElite = plugin.elite === "on";
  const isLocked = plugin.lock === "on";
  const adminKeywords = ["طرد","حظر","رفع","خفض","تغيير","قفل","فتح","kick","ban","promote","demote","admin","group","tagall","hidetag"];
  const cmdArray = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
  const textToCheck = ((plugin.description||"")+" "+cmdArray.join(" ")).toLowerCase();
  const isAdminRelated = adminKeywords.some(k=>textToCheck.includes(k))||plugin.admin===true||plugin.group===true;
  if(isLocked) suffix+=" ┇ ⤹";
  if(isElite) suffix+=" 🌿";
  if(!isLocked && !isElite && isAdminRelated) suffix+=" ┇ ⤹";
  return suffix;
}

function getMainMenuText(categories, totalCmds, eliteCmds, lockedCmds, unsafeCmds) {
  let menu = `
*‏❖══════ •『♦️』• ══════❖*

*❍↵ قـــائـــمــــة أوامــــر الـــبـــوت 🌐*



*❃━═━═✦•〘•🔗•〙•✦═━═━❃*

❒ *الــــفــــئــــات الــــمــــتــــوفــــره :*

`;
  for(const c of categories) {
    menu += `*❍╎🍷 أومــــــــر『  ${c} 』 ⤹* \n\n`;
  }

  menu += `

*╮──〔 📊 احصائيات البوت 〕──╭*
│
│ 🧾 *إجــــمالــــي الأوامــــر* : ${totalCmds}
│ 🔰 *أوامــــر الــــنــــخــــبــــة* : ${eliteCmds}
│ 🔒 *الأوامــــر الــــمــــقــــفــــلــــة* : ${lockedCmds}
│ ⚠️ *الأوامــــر الــــحــــســــاســــة* : ${unsafeCmds}

*‏❖══════ •『 💐 』• ══════❖*

> ⏤͟͟͞͞ 𝐊𝐑𝐎𝐋𝐋𝐎 - 𝑩𝛩𝑻 🕸⃝⃕
`;
  return menu;
}

function getCategoryMenuText(categoryName, commandsList) {
  let categoryMenu = `
*‏❖══════ •『 ${categoryName} 』• ══════❖*

*❍↵ قــــائــــمــــة أوامــــر ${categoryName} 🌐*


`;
  if(commandsList.length === 0) {
    categoryMenu += `*❍╎⚠️ لا توجد أوامر في هذه الفئة*`;
  } else {
    for(const cmd of commandsList) {
      categoryMenu += `*❍╎🍷 .${cmd}*\n\n`;
    }
  }

  categoryMenu += `

*‏❖══════ •『 💐 』• ══════❖*`;

  return categoryMenu;
}

async function execute({ sock, msg, args }) {
  const chatId = msg.key.remoteJid;
  const sender = decode(msg.key.participant||chatId);

  if(activeMenuSessions.has(chatId)) {
    const oldSession = activeMenuSessions.get(chatId);
    sock.ev.off("messages.upsert", oldSession.listener);
    clearTimeout(oldSession.timer);
    activeMenuSessions.delete(chatId);
  }

  try {
    const pluginsRoot = path.join(process.cwd(),"plugins");
    const categories = fs.readdirSync(pluginsRoot).filter(dir=>fs.statSync(path.join(pluginsRoot,dir)).isDirectory());

    // حساب الإحصائيات
    const allPlugins = getPlugins();
    let totalCmds=0, eliteCmds=0, lockedCmds=0, unsafeCmds=0;
    const adminKeywords = ["طرد","حظر","رفع","خفض","تغيير","قفل","فتح","kick","ban","promote","demote","admin","group","tagall","hidetag"];
    for(const plugin of Object.values(allPlugins)) {
      if(!plugin || plugin.hidden) continue;
      totalCmds++;
      if(plugin.elite==="on") eliteCmds++;
      if(plugin.lock==="on") lockedCmds++;
      const cmdArray = Array.isArray(plugin.command)?plugin.command:[plugin.command];
      const textToCheck = ((plugin.description||"")+" "+cmdArray.join(" ")).toLowerCase();
      const isAdminRelated = adminKeywords.some(k=>textToCheck.includes(k))||plugin.admin===true||plugin.group===true;
      if(!plugin.lock && plugin.elite!=="on" && isAdminRelated) unsafeCmds++;
    }

    const mainMenuText = getMainMenuText(categories, totalCmds, eliteCmds, lockedCmds, unsafeCmds);
    
    // مسار الصورة المحدد
    const menuImagePath = "/storage/emulated/0/bot/accounts/Maky/nova/makuv.jpg";
    let mainMessageKey = null;
    
    if (fs.existsSync(menuImagePath)) {
      const sent = await sock.sendMessage(chatId, {
        image: fs.readFileSync(menuImagePath),
        caption: mainMenuText
      }, { quoted: msg });
      mainMessageKey = sent.key;
    } else {
      // إذا لم توجد الصورة، نرسل نص فقط
      const sent = await sock.sendMessage(chatId, { text: mainMenuText }, { quoted: msg });
      mainMessageKey = sent.key;
      console.log("⚠️ الصورة غير موجودة في:", menuImagePath);
    }

    let currentMessageKey = null; // مفتاح الرسالة النصية الحالية (للفئات)
    let state = "MAIN";
    let sessionTimer;

    const listener = async({messages})=>{
      const newMsg = messages[0];
      if(!newMsg.message||newMsg.key.remoteJid!==chatId) return;
      const newSender = decode(newMsg.key.participant||newMsg.key.remoteJid);
      if(newSender!==sender) return;
      const text=newMsg.message?.conversation||newMsg.message?.extendedTextMessage?.text||"";
      if(!text) return;
      const input = text.trim().toLowerCase().replace(/\s+/g,'');

      if(input==="رجوع" || input==="خروج") {
        if(state==="CATEGORY_VIEW" && currentMessageKey) {
          // تعديل الرسالة النصية الحالية إلى القائمة الرئيسية النصية
          await sock.sendMessage(chatId, {
            edit: currentMessageKey,
            text: mainMenuText
          });
          state = "MAIN";
          currentMessageKey = null;
          resetTimer();
        }
        return;
      }

      if(state==="MAIN") {
        const selectedCategory = categories.find(c=>c.toLowerCase().replace(/\s+/g,'')===input);
        if(selectedCategory) {
          // جمع أوامر الفئة
          const plugins = getPlugins();
          const commandsList=[];
          for(const plugin of Object.values(plugins)) {
            if(!plugin||plugin.hidden) continue;
            const pluginPath = plugin.filePath||"";
            if(pluginPath.includes(`/plugins/${selectedCategory}/`)) {
              const cmds = Array.isArray(plugin.command)?plugin.command:[plugin.command];
              const suffix = getCommandStatusSuffix(plugin);
              commandsList.push(`${cmds[0]}${suffix}`);
            }
          }

          const categoryMenuText = getCategoryMenuText(selectedCategory, commandsList);
          
          // إرسال رسالة جديدة للفئة (نصية فقط)
          const sent = await sock.sendMessage(chatId, { text: categoryMenuText }, { quoted: msg });
          currentMessageKey = sent.key;
          state = "CATEGORY_VIEW";
          resetTimer();
        }
      }
    };

    const resetTimer = ()=> {
      if(sessionTimer) clearTimeout(sessionTimer);
      sessionTimer=setTimeout(()=>{ 
        sock.ev.off("messages.upsert",listener); 
        activeMenuSessions.delete(chatId); 
      },180000);
      activeMenuSessions.set(chatId,{listener,timer:sessionTimer});
    };

    resetTimer();
    sock.ev.on("messages.upsert",listener);

  } catch(err){
    console.error("Menu Error:",err);
    await sock.sendMessage(chatId,{text:"❌ حدث خطأ أثناء إنشاء القائمة."});
  }
}

export default { NovaUltra, execute };