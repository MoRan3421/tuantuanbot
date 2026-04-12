const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess-number')
        .setDescription('🎲 团团心里想了一个小数字，主人能猜中吗？✨'),
    async execute(interaction) {
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5)
            .setTitle('🎲 猜数字挑战：团团的小小心愿')
            .setDescription('团团刚才在心里想了一个 **1 到 100** 之间的小数字喔！\n\n请主人在公屏输入猜测的数字喵~ 团团会悄悄告诉您的！\n\n*(提示：这是一个非常可爱的数字喔！)*');

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id && !isNaN(parseInt(m.content));
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        let attempts = 0;
        collector.on('collect', async m => {
            attempts++;
            const guess = parseInt(m.content);

            if (guess === targetNumber) {
                const winEmbed = new EmbedBuilder()
                    .setColor(0xd0f4de)
                    .setTitle('🎊 恭喜主人猜中啦！ ✨')
                    .setDescription(`哇！团团心里想的果然是 **${targetNumber}**！\n主人真是和团团心有灵犀呢喵！\n\n**总计用时:** ${attempts} 次尝试！`)
                    .setFooter({ text: 'Designed by godking512 · 团团超级崇拜您哒！🐾🍡' });
                await m.reply({ embeds: [winEmbed] });
                collector.stop();
            } else if (guess > targetNumber) {
                await m.reply('❌ 哎呀，这个数字太重了，团团搬不动喔！（偏大啦）🍢');
            } else {
                await m.reply('❌ 呜呜，这个数字太轻了，团团会被风吹跑哒！（偏小啦）🌾');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && !collected.some(m => parseInt(m.content) === targetNumber)) {
                interaction.followUp({ content: `⏳ 哎呀，主人的思考时间到啦！团团想的其实是 **${targetNumber}** 喔！我们下次再玩喵 🐾`, ephemeral: true });
            }
        });
    },
};
