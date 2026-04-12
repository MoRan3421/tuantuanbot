const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 让团团为您演奏音乐喵！支持 YT/Spotify')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('想听什么歌？告诉团团吧~')
                .setRequired(true)),
    async execute(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;

        if (!channel) return interaction.reply({ content: '❌ 呜呜，请先进入一个语音频道找团团喔！', ephemeral: true });
        if (interaction.guild.members.me.voice.channelId && interaction.guild.members.me.voice.channelId !== channel.id) {
            return interaction.reply({ content: '❌ 团团正在别的房间唱歌呢，不能分身喔！', ephemeral: true });
        }

        await interaction.reply({ content: '好哒主人！团团正在去搬磁带的路上，请稍等喵~ 🐼🐾', fetchReply: true });

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction,
                    bufferingTimeout: 15000,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEnd: true,
                },
            });

            const embed = new EmbedBuilder()
                .setColor(0xffc5e0) // Pastel Pink
                .setTitle('🎶 团团正在为主唱唱...')
                .setDescription(`**${track.title}**`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: '准备时长', value: `\`${track.duration}\``, inline: true },
                    { name: '原唱大大', value: `\`${track.author}\``, inline: true }
                )
                .setURL(track.url)
                .setFooter({ text: '每一首歌都是团团对主人的表白喔~ 🌸' });

            await interaction.editReply({ content: '拿来啦！音乐开始咯！🍢', embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.editReply(`❌ 呜呜，团团没能找到那盘磁带：\n\`${e.message}\``);
        }
    },
};

