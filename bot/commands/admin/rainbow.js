const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rainbow-mode')
        .setDescription('🌈 开启/关闭至高身份组的绚丽彩虹循环模式！')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('设为彩虹色的身份组')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: '❌ 只有服务器群主方可开启“至高彩虹”模式！', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const db = admin.firestore();
        
        await db.collection('guilds').doc(interaction.guild.id).update({
            rainbowRoleId: role.id
        });

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🌈 至高彩虹模式已激活！')
            .setDescription(`身份组 **${role.name}** 将每分钟自动在彩虹色中循环！✨`);

        await interaction.reply({ embeds: [embed] });
    },
};
