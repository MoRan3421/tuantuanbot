const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🧹 批量清理频道中的废弃信息！(仅限管理)')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('清理的消息数量 (1-100)')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ 只有“管理消息”权限的成员才能动用此扫帚！', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) return interaction.reply({ content: '数量必须在 1 到 100 之间。', ephemeral: true });

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ 团团挥舞扫帚，瞬间清理了 **${deleted.size}** 条消息！✨`, ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: '❌ 清理失败：消息可能超过了 14 天限制。', ephemeral: true });
        }
    },
};
