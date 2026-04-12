const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('📡 探测团团熊猫服务器的脉搏延迟'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '正在探测精英节点... 🐼', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        const embed = new EmbedBuilder()
            .setColor(0xff85a1)
            .setTitle('📡 精英节点状态报告')
            .addFields(
                { name: '🌐 往返延迟 (RTT)', value: `\`${latency}ms\``, inline: true },
                { name: '💓 心跳延迟 (WS)', value: `\`${Math.round(interaction.client.ws.ping)}ms\``, inline: true },
                { name: '🚀 驱动引擎', value: 'Winter Master v7.0', inline: true }
            )
            .setFooter({ text: 'Powered by 团团熊猫游戏主播 (godking512) 🐼' })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
