const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('停止播放并让团团去休息一会儿喵~ 💤'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue) return interaction.reply({ content: '团团现在正闲着呢，没有在唱歌喔！🐼', ephemeral: true });
        
        queue.delete();
        await interaction.reply('好哒！团团这就把耳机摘掉，去竹林里眯一会儿啦... 主人再见喵！👋💤🐾');
    },
};

