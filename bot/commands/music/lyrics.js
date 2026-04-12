const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLyrics } = require('genius-lyrics-api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('🎶 让团团为主人翻开那个装满心事的歌词本本喵~')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('主人想看哪首歌的歌词呀？')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        
        let query = interaction.options.getString('title');
        
        if (!query) {
            return interaction.editReply('❌ 呜呜，主人得告诉团团歌名，团团才能去翻笔记本喔！🐼🎋');
        }

        const options = {
            apiKey: process.env.GENIUS_API_KEY || 'YOUR_GENIUS_API_KEY',
            title: query,
            artist: '',
            optimizeQuery: true
        };

        try {
            const lyrics = await getLyrics(options);
            if (!lyrics) return interaction.editReply('❌ 团团翻遍了整个森林的本本，也没找到这首歌的歌词... 🐾');

            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle(`🎶 《${query}》· 团团的小本本`)
                .setDescription(lyrics.length > 4096 ? lyrics.substring(0, 4090) + '...' : lyrics)
                .setFooter({ text: '每一首歌词都是一个心情喔 🌸' })
                .setTimestamp();

            await interaction.editReply({ content: '找到啦！这是主人想看的歌词喵：🍡', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('❌ 哎呀，团团的笔记本被竹子压住了，暂时打不开，对不起主人！🐼');
        }
    },
};

