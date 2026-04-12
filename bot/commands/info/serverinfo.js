const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('帮主人看看这个服务器的资料哒！🐾'),
    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();
        
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Soft Pink
            .setTitle(`🌸 服务器资料卡: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🆔 这里的身份证号', value: `\`${guild.id}\``, inline: true },
                { name: '👑 领头的大大大大王', value: owner.user.tag, inline: true },
                { name: '👥 这么多小伙伴陪着主人', value: `${guild.memberCount} 位`, inline: true },
                { name: '📅 什么时候成立哒', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false },
                { name: '🌟 闪亮亮的加成级别', value: `第 ${guild.premiumTier} 级`, inline: true },
                { name: '✅ 有没有被认证过喵', value: guild.verified ? '嗯嗯，认证过啦！' : '还没有喔，主人加油！', inline: true }
            )
            .setFooter({ text: '团团今天也要努力收集情报哒~ 🐾' })
            .setTimestamp();

        await interaction.reply({ content: '来了来了！团团飞奔过来给主人送资料啦！🍡', embeds: [embed] });
    },
};

