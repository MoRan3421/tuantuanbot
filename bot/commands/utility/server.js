const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('🏰 团团的小管家报告：这是我们的温馨大家庭喵！✨'),
    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();
        
        const embed = new EmbedBuilder()
            .setColor(0xd0f4de) // Pastel Green
            .setTitle(`🏰 温馨大家庭报告：${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👤 大家长 (Owner)', value: `\`${owner.user.username}\``, inline: true },
                { name: '🤝 家庭成员', value: `\`${guild.memberCount}\` 名`, inline: true },
                { name: '🎂 房屋建造日期', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false },
                { name: '🆔 房屋编号 (ID)', value: `\`${guild.id}\``, inline: true },
                { name: '✨ 我们的活力值', value: `\`Boost Level ${guild.premiumTier}\``, inline: true }
            )
            .setFooter({ text: 'Designed by godking512 · 团团会陪伴每一个主人的！🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '报告主人！团团已经把家里打扫干净啦：🍢', embeds: [embed] });
    },
};
