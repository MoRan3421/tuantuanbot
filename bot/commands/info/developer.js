const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('developer')
        .setDescription('👑 揭秘 TuanTuan Supreme 幕后首席开发者'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('💎 TuanTuan Supreme 创始人名片')
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setDescription('本机器人由 **团团熊猫游戏主播** 倾力打造，旨在构建全球顶尖的 Discord 商业生态系统。')
            .addFields(
                { name: '👤 创始人 (Chief Master)', value: '团团熊猫游戏主播', inline: true },
                { name: '🆔 开发者 ID', value: '`godking512`', inline: true },
                { name: '💻 技术架构', value: 'Winter Master v7.0 / Dual-Brain AI / Firestore Real-time Sync', inline: false },
                { name: '🌟 项目愿景', value: '为每一位群主提供极致的、可变现的自动化管家服务。', inline: false }
            )
            .setFooter({ text: 'Official Founder Edition © 2026' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
