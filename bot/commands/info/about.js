const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('📖 翻开团团熊猫帝国的商业进化史'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('🎋 TuanTuan Supreme 帝国白皮书')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(`**欢迎见证由 团团熊猫游戏主播 (godking512) 亲手打造的顶级生态。**\n\n团团诞生于 2026 年初，旨在将人工智能与社区娱乐完美结合。历经多个版本迭代，如今已进化至 **Winter Master v7.0** 巅峰。`)
            .addFields(
                { name: '🚀 核心进化 v7.0', value: '引入了极简奢华的 Zen Panda 网页端、Groq/Gemini 双脑切换以及实时云同步监听系统。', inline: false },
                { name: '💎 至尊经济', value: '构建了基于激活码的安全变现与等级荣誉体系，让每一位管理员都能轻松运营。', inline: false },
                { name: '👑 创作者信念', value: '由首席大师 godking512 全案策划并维护，坚持每一行代码都带有熊猫的温暖。', inline: false }
            )
            .setFooter({ text: 'Official Imperial Core Edition · BY godking512 🐼' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
