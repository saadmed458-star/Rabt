export default {
    command: 'test',
    description: 'أمر اختبار',
    usage: '.test',
    category: 'اختبار',
    elite: false,
    group: false,

    async execute(sock, message) {
        try {
            const chatId = message.key.remoteJid;
            
            await sock.sendMessage(chatId, {
                text: '✅ البوت شغال 100%'
            });
            
        } catch (error) {
            console.error('❌ خطأ:', error);
        }
    }
};
