const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panda')
        .setDescription('🐼 看看团团的那些超级可爱的“亲戚”们喵！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团这就去大森林里，把最可爱的熊猫宝宝找来给您看喔！🐾🍡', fetchReply: true });
        try {
            const data = await api.getRandomPanda();
            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle('🐼 团团的亲戚大聚会！')
                .setDescription(`**🌸 熊猫宝宝的小秘密:**\n${data.fact}`)
                .setImage(data.image)
                .setFooter({ text: '世界上的每一只熊猫都和主人一样可爱喔！🐾🍡' })
                .setTimestamp();
            await interaction.editReply({ content: '报告主人！找到了一张超级萌的照片：🍢', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('呜呜，森林里雾太大了，团团找不到亲戚了... (>_<) 请稍后再试喵。');
        }
    },
};

