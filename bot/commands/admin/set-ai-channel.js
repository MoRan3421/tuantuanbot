const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-ai-channel')
        .setDescription('🧠 指定一个频道作为团团的“AI 实验室”！(仅限管理)')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('要设为 AI 实验室的频道')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 只有“全权管理员”才能指定我的实验室！', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const db = admin.firestore();
        const guildRef = db.collection('guilds').doc(interaction.guild.id);
        
        await guildRef.set({ aiChannelId: channel.id }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(0xff9a9e)
            .setTitle('🧠 AI 实验室已就绪')
            .setDescription(`团团已经在 <#${channel.id}> 频道里等待您的召唤了！\n在此频道发消息我将自动为您卖萌回复！`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
