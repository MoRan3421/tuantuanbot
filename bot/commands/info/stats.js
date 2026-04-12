const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 看看团团这段时间的小小成就喵！✨'),
    async execute(interaction) {
        const client = interaction.client;
        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('📊 团团的小小成就榜')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription('团团一直在努力变强，为主人们提供更好的服务喔！🌸')
            .addFields(
                { name: '🏠 去过多少个家', value: `\`${totalServers}\` 个服务器`, inline: true },
                { name: '🫂 抱抱了多少主人', value: `\`${totalUsers.toLocaleString()}\` 位`, inline: true },
                { name: '⏳ 醒着陪主人的时间', value: `\`${days}天 ${hours}时 ${minutes}分\``, inline: true },
                { name: '✨ 团团的魔法核心', value: 'Kawaii Panda v7.0', inline: true },
                { name: '🍡 目前的精神状态', value: '饱餐竹子中...', inline: true },
                { name: '👑 首席大熊猫老师', value: 'godking512', inline: true }
            )
            .setFooter({ text: 'Designed by godking512 with love & bamboo 🎋' })
            .setTimestamp();

        await interaction.reply({ content: '来了来了！这是团团最自豪的成绩单喔：🍢', embeds: [embed] });
    },
};

