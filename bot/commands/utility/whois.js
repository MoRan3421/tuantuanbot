const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('🕵️‍♀️ 团团的小放大镜：看看这位主人的秘密档案喵！✨')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('想揭开谁的秘密呀？')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const db = admin.firestore();
        const memberRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);
        const doc = await memberRef.get();
        const data = doc.exists ? doc.data() : { xp: 0, level: 1, bamboo: 0 };
        
        const configRef = db.collection('guilds').doc(interaction.guild.id);
        const configDoc = await configRef.get();
        const isPremium = configDoc.exists && configDoc.data().isPremium;

        const embed = new EmbedBuilder()
            .setColor(isPremium ? 0xFFD700 : 0xa2d2ff) // Gold for premium, Pastel Blue for others
            .setTitle(`👤 团团特派侦查报告：${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`在这里，每个人都是团团最珍贵的主人喔！✨`)
            .addFields(
                { name: '🎖️ 茁壮等级', value: `\`LV. ${data.level || 1}\``, inline: true },
                { name: '🎋 竹子库存', value: `\`${data.bamboo || 0}\` 根`, inline: true },
                { name: '💎 身份位阶', value: isPremium ? '至尊熊猫金主 🥇' : '可爱熊猫之友 🐾', inline: true },
                { name: '📅 第一次抱抱', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎂 破壳日期', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: false }
            )
            .setFooter({ text: 'Designed by godking512 · 每一份档案都是团团的宝贝 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '报告主人！团团已经悄悄摸清他的底细咯：🍢', embeds: [embed] });
    },
};
