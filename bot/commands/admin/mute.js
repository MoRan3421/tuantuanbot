const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🤫 给吵闹的小喇叭戴上精致的“静音口罩”喵！(仅限管理)')
        .addUserOption(option => option.setName('target').setDescription('派给哪只小喇叭？').setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('戴多久呢？(分钟)')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: '❌ 呜呜，主人没有“禁言魔法”，团团帮不了你喔！', ephemeral: true });
        }

        const user = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: '❌ 团团找不到那只小喇叭了喵！', ephemeral: true });
        if (!member.moderatable) return interaction.reply({ content: '❌ 这只小喇叭太强了，团团戴不上口罩（权限不足）！', ephemeral: true });

        await member.timeout(duration * 60 * 1000);

        const embed = new EmbedBuilder()
            .setColor(0xd8bfd8) // Pastel Purple (Thistle)
            .setTitle('🤫 静音魔法生效中！')
            .setDescription(`**${user.username}** 已经戴上了团团特制的静音口罩，将保持安静 **${duration}** 分钟喔！\n\n**建议:** 让他静静思考一下为什么这么吵喵~\n**施法者:** ${interaction.user.username}\n**Panda Keeper:** godking512`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: '团团的静音口罩：止汗专用（误） 🐾' })
            .setTimestamp();

        await interaction.reply({ content: '嘘——！世界一下子清静好多了：🍢', embeds: [embed] });
    },
};
