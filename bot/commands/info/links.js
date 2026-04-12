const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription('🚀 开启 TuanTuan Supreme 帝国的至尊传送阵'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('🚀 TuanTuan 至尊传送门户')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription('**由 团团熊猫游戏主播 (godking512) 官方维护。**\n\n请点击下方按钮直接进入对应的精英功能版块。')
            .addFields(
                { name: '🌐 Elite Hub', value: '管理您的服务器 AI、音乐与安全模块。', inline: true },
                { name: '📩 Invite Bot', value: '将 Winter Master v7.0 引入您的领地。', inline: true }
            )
            .setFooter({ text: 'Imperial Gateways · BY godking512 🐼' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('在线后台 🌐')
                .setStyle(ButtonStyle.Link)
                .setURL('https://tuantuanbot-28647.web.app'),
            new ButtonBuilder()
                .setLabel('邀请团团 📩')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
