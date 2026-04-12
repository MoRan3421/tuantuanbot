const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('🎋 陪团团去竹林采摘新鲜的下午茶喵！🍡'),
    async execute(interaction) {
        const db = admin.firestore();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        
        const userRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
        const doc = await userRef.get();
        
        const now = new Date();
        if (doc.exists) {
            const data = doc.data();
            const lastWork = data.last_work ? data.last_work.toDate() : new Date(0);
            const cooldown = 60 * 60 * 1000; // 1 hour
            
            if (now - lastWork < cooldown) {
                const remaining = Math.ceil((cooldown - (now - lastWork)) / 60000);
                return interaction.reply({ content: `❌ 呜呜，团团刚才采竹子采累了，正在揉肚肚呢... 请在 **${remaining}** 分钟后再带我去嘛！💤🐾`, ephemeral: true });
            }
        }

        const xpGained = Math.floor(Math.random() * 20) + 10;
        const bambooGained = Math.floor(Math.random() * 15) + 5;

        await userRef.set({
            xp: admin.firestore.FieldValue.increment(xpGained),
            bamboo: admin.firestore.FieldValue.increment(bambooGained),
            last_work: now
        }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(0xd0f4de) // Pastel Green
            .setTitle('🎋 竹林野餐大丰收！✨')
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setDescription(`主人 **${interaction.user.username}** 真是太厉害啦！我们刚才在竹林里找到了：\n\n✨ **+${xpGained} 茁壮值**\n🍡 **+${bambooGained} 甜甜竹子**\n\n团团今晚可以加餐咯，最喜欢主人啦！🐾💖`)
            .setFooter({ text: '所有的竹子都会存进主人的小金库喔 🍢' })
            .setTimestamp();

        await interaction.reply({ content: '嘿咻！嘿咻！团团和主人回来啦！🍡', embeds: [embed] });
    },
};

