const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('🤣 团团给主人讲个“冷飕飕”的小笑话喵！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团正在翻找我的《熊猫笑话大全》，请稍等喵~ 🐾🎋', fetchReply: true });
        try {
            const data = await api.getRandomJoke();
            const embed = new EmbedBuilder()
                .setColor(0xa2d2ff) // Pastel Blue
                .setTitle('🤣 团团的冷笑话馆')
                .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
                .addFields(
                    { name: '✨ 奇思妙想 (问):', value: `\`${data.setup}\`` },
                    { name: '🍢 意想不到 (答):', value: `||${data.punchline}||` }
                )
                .setFooter({ text: '如果不好笑，请不要扣团团的竹子喔 🐾🍡' })
                .setTimestamp();
            await interaction.editReply({ content: '找到啦！主人准备好捂肚子了吗：🍢', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('呜呜，团团忘词了... (>_<) 可能是竹子吃太饱，脑筋转不动了喵。');
        }
    },
};
