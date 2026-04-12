const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const admin = require('firebase-admin');
const { generateProfileCard } = require('../../utils/rank-card');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('🎴 快来查看主人的至尊熊猫名片喵！有美美的图片喔！✨')
        .addUserOption(option => option.setName('target').setDescription('想看谁的名片呢？')),
    async execute(interaction) {
        await interaction.deferReply();
        
        const user = interaction.options.getUser('target') || interaction.user;
        const db = admin.firestore();
        
        const memberRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);
        const doc = await memberRef.get();
        const data = doc.exists ? doc.data() : { xp: 0, level: 1, bamboo: 0, hugs: 0, kisses: 0 };

        try {
            const buffer = await generateProfileCard(user, data);
            const attachment = new AttachmentBuilder(buffer, { name: 'profile-card.png' });

            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle(`🎴 团团至尊认证：${user.username} 的专属名片`)
                .setDescription(`报告主人！这就是在 **TuanTuan Supreme** 宇宙里最闪亮的名片喵！✨`)
                .setImage('attachment://profile-card.png')
                .setFooter({ text: 'Designed by godking512 · 团团在努力记录主人的每一步进步哒！🐾' })
                .setTimestamp();

            await interaction.editReply({ content: '噔噔蹬蹬！您的专属名片已经送达啦：🍢', files: [attachment], embeds: [embed] });
        } catch (error) {
            console.error('Profile Card Error:', error);
            await interaction.editReply('呜呜... 团团的画笔断了，暂时只能用文字报告了喵：\n' + `**等级:** ${data.level || 1} | **竹子:** ${data.bamboo || 0}`);
        }
    },
};
