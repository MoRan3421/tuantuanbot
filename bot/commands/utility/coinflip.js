const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('🪙 犹豫不决吗？快让团团抛个“好运硬币”帮主人做决定喵！✨'),
    async execute(interaction) {
        const isHeads = Math.random() < 0.5;
        const result = isHeads ? '✨ 正面 (大太阳)' : '🌙 反面 (小月亮)';
        
        const embed = new EmbedBuilder()
            .setColor(0xffd700) // Gold
            .setTitle('🪙 团团的好运硬币')
            .setDescription(`报告主人！硬币在空中转了好多个圈圈，最后落下的结果是：\n\n**${result}**喵！`)
            .setThumbnail(isHeads 
                ? 'https://cdn-icons-png.flaticon.com/512/2698/2698194.png' 
                : 'https://cdn-icons-png.flaticon.com/512/2698/2698213.png')
            .setFooter({ text: '让团团来帮主人做命中注定的选择喵 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '嘿咻！团团用力把硬币抛向天空咯... 🍡', embeds: [embed] });
    },
};

