const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('⏭️ 团团这就滑过这首歌，换下一首喵！✨'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '呜呜，团团现在没在唱歌，想听歌快点一首嘛！🐼🎋', ephemeral: true });
        }
        
        queue.node.skip();
        await interaction.reply('⏩ 咻——！团团已经把这首歌滑走啦，下一首开始咯！🍡🐾');
    },
};

