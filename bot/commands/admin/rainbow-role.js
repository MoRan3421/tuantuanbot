const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rainbow-role')
        .setDescription('🌈 设置一个自动变换颜色的彩虹身份组！(仅限管理)')
        .addRoleOption(option => option.setName('role').setDescription('要变色的身份组').setRequired(true))
        .addBooleanOption(option => option.setName('active').setDescription('是否开启彩虹变色？').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 只有服务器的主人或者是大管家（管理员）才能开启彩虹派对哦！', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const active = interaction.options.getBoolean('active');
        const db = admin.firestore();

        if (active) {
            await db.collection('guilds').doc(interaction.guild.id).set({
                rainbowRoleId: role.id
            }, { merge: true });

            const embed = new EmbedBuilder()
                .setColor(0xffffff)
                .setTitle('🌈 彩虹变色已激活！')
                .setDescription(`身份组 **${role.name}** 现在已经进入了全自动变色模式！\n团团每分钟都会为您更换一种亮眼的颜色哦~ 🎋✨`)
                .setFooter({ text: 'Supreme Elite Hub · 顶级视觉盛宴 🐼' });

            await interaction.reply({ embeds: [embed] });
        } else {
            await db.collection('guilds').doc(interaction.guild.id).set({
                rainbowRoleId: null
            }, { merge: true });
            await interaction.reply(`🌈 **${role.name}** 的彩虹变色已停止，恢复宁静。`);
        }
    },
};
