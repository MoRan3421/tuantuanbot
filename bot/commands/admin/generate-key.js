const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate-key')
        .setDescription('👑 [开发者专用] 生成 TuanTuan Supreme+ 激活码')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('有效时长')
                .setRequired(true)
                .addChoices(
                    { name: '1 月 (30Days)', value: '30' },
                    { name: '1 年 (365Days)', value: '365' },
                    { name: '永久 (Lifetime)', value: '9999' }
                )),
    async execute(interaction) {
        const devId = process.env.DEV_ID || 'NONE';
        if (interaction.user.id !== devId && interaction.user.username !== 'godking512') {
            return interaction.reply({ content: '❌ 抱歉老板，此为 **商业资产生成器**，非指定的 Developer ID 无法操作哦！🐼🎋', ephemeral: true });
        }
        
        await interaction.deferReply({ ephemeral: true });

        const duration = parseInt(interaction.options.getString('duration'));
        
        // Generate a cool looking key: TUAN-XXXX-XXXX-XXXX
        const generateSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
        const key = `TUAN-${generateSegment()}-${generateSegment()}-${generateSegment()}`;

        const db = admin.firestore();
        await db.collection('premium_keys').doc(key).set({
            durationDays: duration,
            generatedBy: interaction.user.id,
            generatedAt: new Date(),
            used: false
        });

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🔑 Supreme+ 激活码生成成功')
            .setDescription(`已成功生成一个高级版服务器激活码！请小心保管！`)
            .addFields(
                { name: '🎟️ 激活码 (License Key)', value: `\`${key}\`` },
                { name: '⏳ 时长', value: duration === 9999 ? '永久有效 生生世世 🐼' : `${duration} 天`, inline: true }
            )
            .setFooter({ text: 'Supreme Elite Developer Tool' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
