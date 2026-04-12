const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('查看用户的高清头像！📸')
        .addUserOption(option => option.setName('target').setDescription('要查看头像的用户')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor(0xff9a9e)
            .setTitle(`📸 ${user.username} 的高清头像`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: '团团摄像机' });

        await interaction.reply({ embeds: [embed] });
    },
};
