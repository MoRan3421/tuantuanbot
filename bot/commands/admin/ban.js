const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 请不乖的小朋友去遥远的北极旅行喵！(仅限管理)')
        .addUserOption(option => option.setName('target').setDescription('派谁去旅行呢？').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('为什么要送走它呀？')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: '❌ 呜呜，主人没有“赶走坏蛋”的魔法，团团帮不了你喔！', ephemeral: true });
        }

        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || '它可能不太适合留在我们的温馨小屋窝~';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: '❌ 团团没找到这只小家伙，它是不是已经跑掉啦？', ephemeral: true });
        if (!member.bannable) return interaction.reply({ content: '❌ 这只小家伙等级太高了，团团挥不动小竹竿（权限不足）！', ephemeral: true });

        await member.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor(0xffd1dc) // Pastel Red/Pink
            .setTitle('🔨 团团的终极惩罚！')
            .setDescription(`**${user.username}** 已经被团团送到了遥远的北极，不再回来啦！\n\n**原因:** ${reason}\n**执行官:** ${interaction.user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: '团团的小鞭子：专治各种不服 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '哼！坏蛋已经被团团赶跑咯：🍢', embeds: [embed] });
    },
};

