const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-list')
        .setDescription('👑 [仅限老板] 查看全服 Supreme+ 至尊会员订阅总表')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Security check: Only the developer ID specified in .env can see this
        const devId = process.env.DEV_ID || 'NONE';
        if (interaction.user.id !== devId && interaction.user.username !== 'godking512') {
            return interaction.reply({ content: '❌ 抱歉老板，此为商业机密指令，非指定的 Developer ID 无法查看哦！🐼🎋', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const db = admin.firestore();
        const premiumGuilds = await db.collection('guilds').where('isPremium', '==', true).get();

        if (premiumGuilds.empty) {
            return interaction.editReply('📭 目前还没有服务器激活至尊版。快去发码赚钱吧！💰');
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('💎 TuanTuan Supreme+ 商业全景视图')
            .setDescription(`当前共有 **${premiumGuilds.size}** 个服务器激活了至尊版。`)
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setTimestamp();

        let listContent = '';
        premiumGuilds.forEach(doc => {
            const data = doc.data();
            const expire = data.premiumExpire === 'LIFETIME' ? '♾️ 永久' : '⏳ 计时中';
            listContent += `🏢 **${data.guildName || '未知服务器'}** (ID: \`${doc.id}\`)\n` +
                          `└ 状态: ${expire} | 引擎: ${data.aiEngine || 'GEMINI'}\n\n`;
        });

        embed.setDescription(listContent || '暂无内容');
        embed.setFooter({ text: 'Supreme Elite Hub 商业情报系统 🐼' });

        await interaction.editReply({ embeds: [embed] });
    },
};
