const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('📜 翻阅 TuanTuan Supreme 帝国的至尊进化全志'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('📜 TuanTuan Supreme 进化全志')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription('**见证由 团团熊猫游戏主播 (godking512) 领导的大型架构重组。**')
            .addFields(
                { name: '🌟 v7.0 Zenith (Current)', value: '• 全新 Zen Panda 极简奢华后台\n• Firestore 全服毫秒级 Snapshot 同步\n• Gemini 💎 & Groq ⚡ 双脑热切换\n• 创始人所有权物理隔离锁', inline: false },
                { name: '🚀 v6.0 Performance', value: '• 核心逻辑模块化重构\n• 全新的音乐播报卡片 UI\n• 商業激活码核销系统上线', inline: false },
                { name: '🎋 v5.0 Foundation', value: '• 引入全局经验与等级 3.0\n• 基础 AI 画图与问答原型', inline: false }
            )
            .setFooter({ text: 'Evolution Log · BY godking512 🐼' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
