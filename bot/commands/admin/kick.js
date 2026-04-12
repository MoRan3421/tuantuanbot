const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 把不听话的小淘气送出大森林喵！(仅限管理)')
        .addUserOption(option => option.setName('target').setDescription('想送走哪只小淘气？').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('为什么要送它出去呀？')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: '❌ 呜呜，主人没有“请人出门”的魔法喔！', ephemeral: true });
        }

        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || '这只小淘气需要去森林外面反省一下喵~';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: '❌ 团团没找到这只小淘气，它是不是已经自己溜走啦？', ephemeral: true });
        if (!member.kickable) return interaction.reply({ content: '❌ 这只小淘气太沉了，团团推不动（权限不足）！', ephemeral: true });

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setColor(0xffffd1) // Pastel Yellow
            .setTitle('👢 团团的小手拍！')
            .setDescription(`**${user.username}** 已经被团团轻轻拍出了大门，记得下次要乖喔！\n\n**原因:** ${reason}\n**送行官:** ${interaction.user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: '团团的小手拍：下次要乖喔 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '好啦！小淘气已经去门外休息咯：🍢', embeds: [embed] });
    },
};

