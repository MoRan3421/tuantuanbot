const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🖼️ 团团的小相框：看看主人的美照喵！✨')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('想看哪位主人的美照呀？')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle(`🖼️ ${user.username} 的专属美照`)
            .setDescription(`哇！这张照片里的主人真是闪闪发光呢喵！✨`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: 'Designed by godking512 · 团团会把它存进小本本哒！🐾🍡' })
            .setTimestamp();

        const row = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: '下载这张照片 📥',
                    style: 5,
                    url: user.displayAvatarURL({ dynamic: true, size: 4096 })
                }
            ]
        };

        await interaction.reply({ content: '报告主人！已经为您展示出来咯：🍢', embeds: [embed], components: [row] });
    },
};
