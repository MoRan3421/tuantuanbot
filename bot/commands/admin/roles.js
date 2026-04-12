const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-role')
        .setDescription('🎨 快速创建一个带颜色的身份组！')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('身份组名称')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('Hex颜色码 (如 #ff0000) 或颜色名 (RED, BLUE)')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: '❌ 你没有权限管理身份组！', ephemeral: true });
        }

        const name = interaction.options.getString('name');
        const color = interaction.options.getString('color');

        try {
            const role = await interaction.guild.roles.create({
                name: name,
                color: color,
                reason: 'TuanTuan Color Role Creation'
            });
            await interaction.reply(`✅ 成功创建身份组: **${role.name}**，颜色: **${color}**！🐼✨`);
        } catch (e) {
            await interaction.reply({ content: '❌ 颜色格式不对或权限不足！', ephemeral: true });
        }
    },
};
