const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('看看团团的反应速度喵！(Pong!)'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '团团正在努力跑过来... 🐼🐾', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = interaction.client.ws.ping;
        
        let healthColor = 0xa2d2ff; // Pastel Blue
        let healthText = '✅ 丝滑顺畅，像在舔竹子！';
        if (latency > 200 || apiPing > 200) {
            healthColor = 0xffffd1; // Pastel Yellow
            healthText = '⚠️ 团团有点跑不动了...';
        }
        if (latency > 500 || apiPing > 500) {
            healthColor = 0xffd1dc; // Pastel Pink/Red
            healthText = '🚨 团团可能中暑了，救命！';
        }

        const embed = new EmbedBuilder()
            .setColor(healthColor)
            .setTitle('🏓 Pong! 团团的心跳报告')
            .setDescription('团团吃饱了竹子，极速向主人报到！')
            .addFields(
                { name: '🐼 团团反应 (Latency)', value: `\`${latency}ms\``, inline: true },
                { name: '📡 分身心跳 (API)', value: `\`${apiPing}ms\``, inline: true },
                { name: '🏥 现在的心情', value: `\`${healthText}\``, inline: false }
            )
            .setFooter({ text: '来自团团的小屋 🐾' })
            .setTimestamp();

        await interaction.editReply({ content: '好哒主人！团团已经跑过来了喔！🍡', embeds: [embed] });
    },
};

