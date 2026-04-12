const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('🔊 悄悄拧一下团团小音头的音量旋钮喵~')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('音量要调到多大呢？(1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ 呜呜，团团还没开始唱歌呢，没法调音量喔！', ephemeral: true });
        }

        const level = interaction.options.getInteger('level');
        queue.node.setVolume(level);

        const embed = new EmbedBuilder()
            .setColor(0xa2d2ff) // Pastel Blue
            .setTitle('🔊 旋钮拧好啦！✨')
            .setDescription(`音量已经为主张调到 **${level}%** 啦！${'🍡'.repeat(Math.ceil(level / 20))}`)
            .setFooter({ text: '团团会一直在这个频道陪着主人喔~ 🎶' })
            .setTimestamp();

        await interaction.reply({ content: '好哒！团团这就去调一下：', embeds: [embed] });
    },
};

