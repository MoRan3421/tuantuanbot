const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-stats')
        .setDescription('📊 查看本服务器的 TuanTuan Supreme+ 模块运营状态')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const db = admin.firestore();
        const guildDoc = await db.collection('guilds').doc(interaction.guild.id).get();
        const config = guildDoc.exists ? guildDoc.data() : {};

        const isPremium = config.isPremium || false;
        const premiumStatus = isPremium ? '💎 **SUPREME+ 已激活**' : '🎋 基础版';
        const engine = config.aiEngine || 'GEMINI';
        
        const embed = new EmbedBuilder()
            .setColor(isPremium ? 0xFFD700 : 0xff85a1)
            .setTitle(`🏢 ${interaction.guild.name} · 运营看板`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '🎟️ 订阅状态', value: premiumStatus, inline: true },
                { name: '⏳ 过期时间', value: config.premiumExpire === 'LIFETIME' ? '♾️ 永久' : '计时结束', inline: true },
                { name: '🧠 AI 引擎', value: `\`${engine}\``, inline: true },
                { name: '🎵 音乐系统', value: config.musicEnabled ? '✅ 开启' : '❌ 关闭', inline: true },
                { name: '📈 等级系统', value: config.levelsEnabled ? '✅ 开启' : '❌ 关闭', inline: true },
                { name: '💬 AI 响应', value: config.aiEnabled ? '✅ 开启' : '❌ 关闭', inline: true }
            )
            .setFooter({ text: 'Supreme Elite Hub 运维大屏 · Founder godking512 🐼' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
