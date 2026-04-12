const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('🕵️‍♀️ 帮主人瞧瞧这只路过的小可爱的秘密喵！✨')
        .addUserOption(option => option.setName('target').setDescription('想偷看谁的小本本呀？(默认你自己)')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const embed = new EmbedBuilder()
            .setColor(0xa2d2ff) // Pastel Blue
            .setTitle(`👤 团团的特派侦查报告：${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🆔 这里的门牌号 (ID)', value: `\`${user.id}\``, inline: true },
                { name: '🤖 它是小机器人吗', value: user.bot ? '嗯嗯，是团团的同伴喔！' : '不是哒，是个温柔的人类！', inline: true },
                { name: '📅 第一次抱抱的时间', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false },
                { name: '🎂 这只小可爱破壳的时间', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🎨 给它的颜色 (Roles)', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') : '还没有穿上漂亮的衣服喔~', inline: false }
            )
            .setFooter({ text: '团团的显微镜已经对准它啦！🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '报告主人！团团已经悄悄摸清它的底细咯：🍢', embeds: [embed] });
    },
};

