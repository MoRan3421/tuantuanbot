const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-prefix')
        .setDescription('⌨️ 更改此服务器的指令前缀 (默认为 !)')
        .addStringOption(option => option.setName('new_prefix').setDescription('新的前缀符号').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 只有管理员能更改团团的接头暗号！', ephemeral: true });
        }

        const prefix = interaction.options.getString('new_prefix');
        const db = admin.firestore();

        await db.collection('guilds').doc(interaction.guild.id).set({
            prefix: prefix
        }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(0x00FF88)
            .setTitle('⌨️ 前缀已更新')
            .setDescription(`从此以后，在这个服务器请使用 \`${prefix}\` 作为指令前缀哦！\n(例如: \`${prefix}help\`)`)
            .setFooter({ text: 'Supreme Elite Hub 🐼' });

        await interaction.reply({ embeds: [embed] });
    },
};
