const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('📩 把超可爱的团团熊猫带回您的服务器！'),
    async execute(interaction) {
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('🎋 团团熊猫邀请函')
            .setDescription('**想让您的服务器也拥有双脑 AI、顶级音乐和至尊等级系统吗？**\n\n点击下方按钮，即可将 Winter Master 7.0 核心带回您的领地！')
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .addFields(
                { name: '👑 创作者', value: '团团熊猫游戏主播 (godking512)', inline: true },
                { name: '🚀 核心版本', value: 'Supreme Elite v7.0', inline: true }
            )
            .setFooter({ text: 'Designed with love by godking512 🐼' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('立即邀请团团 📩')
                .setStyle(ButtonStyle.Link)
                .setURL(inviteUrl),
            new ButtonBuilder()
                .setLabel('前往精英控制台 🌐')
                .setStyle(ButtonStyle.Link)
                .setURL('https://tuantuanbot-28647.web.app')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
