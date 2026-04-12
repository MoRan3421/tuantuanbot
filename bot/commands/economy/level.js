const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const admin = require('firebase-admin');
const { generateRankCard } = require('../../utils/rank-card');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('📊 想看看现在的等级和“锦鲤值”有多少吗？喵！✨')
        .addUserOption(option => option.setName('target').setDescription('想偷看哪个小伙伴的等级呀？')),
    async execute(interaction) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('target') || interaction.user;
        const db = admin.firestore();
        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            return interaction.editReply({ content: user.id === interaction.user.id ? '主人还没开过口呢，快去聊天赚取“采竹值”吧！🐾' : '这只小伙伴躲在草丛里，团团还没发现它的记录喔。' });
        }

        const data = doc.data();
        
        try {
            const buffer = await generateRankCard(user, data);
            const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });

            const embed = new EmbedBuilder()
                .setColor(0xffb7c5)
                .setTitle(`📊 ${user.username} 的成长进度报告`)
                .setDescription(`主人加油！现在的等级是 **${data.level || 1}**，距离变强又近了一步喔！✨`)
                .setImage('attachment://rank-card.png')
                .setFooter({ text: '聊天越多，团团就陪你越久喔！🍡 | Designed by godking512' })
                .setTimestamp();

            await interaction.editReply({ content: '报告主人！找出了最漂亮的成长卡片喵：🐾', files: [attachment], embeds: [embed] });
        } catch (error) {
            console.error('Level Card Error:', error);
            await interaction.editReply('呜呜，团团的画笔断了，暂时只能用文字报告了喵：\n' + `**等级:** ${data.level || 1} | **经验:** ${data.xp || 0}`);
        }
    },
};
