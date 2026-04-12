const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const admin = require('firebase-admin');
const { generateRankCard } = require('../../utils/rank-card');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('v3-rank')
        .setDescription('🏆 尊贵的主人特权：查看“至尊 3.0”熊猫排名卡片喵！✨')
        .addUserOption(option => option.setName('target').setDescription('想看哪个大咖的排名呀？')),
    async execute(interaction) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('target') || interaction.user;
        const db = admin.firestore();
        
        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);
        const doc = await userRef.get();
        if (!doc.exists) {
            return interaction.editReply({ content: `**${user.username}** 还没有开始熊猫大探险呢！🎋` });
        }
        
        const data = doc.data();
        
        try {
            // Force high-rank background for V3
            const buffer = await generateRankCard(user, { ...data, level: 99 }); 
            const attachment = new AttachmentBuilder(buffer, { name: 'v3-rank-card.png' });

            const embed = new EmbedBuilder()
                .setColor(0xffb7c5)
                .setTitle(`🏆 至尊 3.0 熊猫身份卡：${user.username}`)
                .setDescription(`主人是 **TuanTuan Supreme** 宇宙的传奇探索者！✨`)
                .setImage('attachment://v3-rank-card.png')
                .setFooter({ text: 'Designed by godking512 · 团团至尊 3.0 🐾🍢' })
                .setTimestamp();

            await interaction.editReply({ content: '报告主人！找出了最豪华的至尊卡片喵：🐾', files: [attachment], embeds: [embed] });
        } catch (error) {
            console.error('V3 Rank Error:', error);
            await interaction.editReply('呜呜，至尊画笔坏掉了，团团这就去修喵！🐾');
        }
    },
};
