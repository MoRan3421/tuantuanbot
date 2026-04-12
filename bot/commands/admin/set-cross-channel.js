const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-cross-channel')
        .setDescription('🌐 设置此频道为"熊猫漫游"跨服聊天频道！(仅限管理)')
        .addBooleanOption(option => 
            option.setName('active')
                .setDescription('是否开启跨服聊天？')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 只有管理员才能开启超维度传送门哦！', ephemeral: true });
        }

        const active = interaction.options.getBoolean('active');
        const db = admin.firestore();

        if (active) {
            await db.collection('guilds').doc(interaction.guild.id).set({
                crossChannelId: interaction.channel.id
            }, { merge: true });

            const embed = new EmbedBuilder()
                .setColor(0x00FF88)
                .setTitle('🌐 熊猫漫游：传送门已开启！')
                .setDescription('此频道现在已连接到 **TuanTuan Cross-Server Network**。\n在此发送的所有消息（除指令外）都将同步到其他开启了此功能的服务器！\n\n⚠️ **提示**：请保持文明聊天，团团在后面看着呢~')
                .setFooter({ text: 'Supreme Elite Hub · 跨服通讯网 🐼✨' });

            await interaction.reply({ embeds: [embed] });
        } else {
            await db.collection('guilds').doc(interaction.guild.id).set({
                crossChannelId: null
            }, { merge: true });
            await interaction.reply('🌐 传送门已关闭，此频道现在回归宁静。');
        }
    },
};
