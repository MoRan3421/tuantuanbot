const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('🎲 掷骰子！默认 6 面，也可以自定义面数。')
        .addIntegerOption(option => 
            option.setName('sides')
                .setDescription('骰子面数 (默认 6)')
                .setRequired(false)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🎲 掷骰子结果')
            .setDescription(`团团掷出了一个 **${sides}** 面骰子... 结果是：**${result}**！`)
            .setThumbnail('https://api.dicebear.com/7.x/initials/svg?seed=' + result);
        await interaction.reply({ embeds: [embed] });
    },
};
