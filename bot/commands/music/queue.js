const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('📜 看看团团的小愿望单，接下来会唱什么呢？✨'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue) return interaction.reply({ content: '呜呜，愿望单现在是空的，主人快往里面加歌呀！🐼🎋', ephemeral: true });

        const tracks = queue.tracks.toArray();
        const currentTrack = queue.currentTrack;

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('🎶 团团的小愿望单')
            .setDescription(`**正在主唱:**\n🎵 \`${currentTrack.title}\`\n\n**接下来准备:**\n${tracks.length > 0 ? tracks.map((t, i) => `${i + 1}. \`${t.title}\``).slice(0, 10).join('\n') : '后面没有歌啦，快点几首让团团继续唱嘛！'}`)
            .setFooter({ text: `愿望单里还有 ${tracks.length} 个小秘密喔 🍡` })
            .setTimestamp();

        await interaction.reply({ content: '好哒！这些是团团待会儿要唱的歌喔：🍢', embeds: [embed] });
    },
};

