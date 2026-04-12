const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('🐱 团团帮主人抓来一只超级软萌的小喵喵！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团这就去隔壁猫窝跑一趟，把最乖的小喵喵带回来喔！🐾🍡', fetchReply: true });
        try {
            const url = await api.getRandomCat();
            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle('🐱 遇见一只小喵喵！')
                .setImage(url)
                .setFooter({ text: '团团和喵喵，主人更喜欢哪一个呢？🐾🍡' })
                .setTimestamp();
            await interaction.editReply({ content: '抓到啦！主人快看它多可爱：🍢', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('呜呜，小喵喵跑得太快了，团团没抓着... (>_<) 请稍后再试喵。');
        }
    },
};
