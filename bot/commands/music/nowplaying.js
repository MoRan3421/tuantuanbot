const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('🎵 看看团团现在正在为谁哼歌呢？✨'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '呜呜，团团现在还没开张唱歌呢，主人快点一首嘛！🐼🎋', ephemeral: true });
        }

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar();

        const db = admin.firestore();
        const guildDoc = await db.collection('guilds').doc(interaction.guild.id).get();
        const isPremium = guildDoc.exists && guildDoc.data().isPremium;

        const embed = new EmbedBuilder()
            .setColor(isPremium ? 0xffd1dc : 0xa2d2ff) // Pastel Pink or Blue
            .setTitle(isPremium ? '💎 团团 · 豪华视听秀' : '🎵 团团正在主唱...')
            .setDescription(`**${track.title}**\n\n${progress}\n\n${isPremium ? '✨ 主人已解锁 **至尊高保真音质**，听得团团都醉啦~' : '🎋 团团正在用普通小喇叭为您广播喔~'}`)
            .setThumbnail(track.thumbnail)
            .setURL(track.url)
            .setFooter({ text: `演唱: ${track.author} · 听众: ${interaction.user.username} 🌸` })
            .setTimestamp();

        await interaction.reply({ content: '嘘... 仔细听，团团唱得好不好听呀？🍡', embeds: [embed] });
    },
};

