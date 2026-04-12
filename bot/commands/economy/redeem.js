const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('🌟 激活 TuanTuan Supreme+ 尊贵付费版以解锁全服特权！')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('key')
                .setDescription('请输入你的激活码 (例如 TUAN-XXXX-XXXX)')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const inputKey = interaction.options.getString('key').trim();
        const db = admin.firestore();
        
        const keyRef = db.collection('premium_keys').doc(inputKey);
        const keyDoc = await keyRef.get();

        if (!keyDoc.exists) {
            return interaction.editReply('❌ **无效的激活码！** 请检查拼写或前往网页商店购买。\n🌐 [前往购买 Elite Hub Supreme+](https://tuantuanbot-28647.web.app)');
        }

        const keyData = keyDoc.data();
        if (keyData.used) {
            return interaction.editReply('❌ **此激活码已被使用！**');
        }

        const guildId = interaction.guild.id;
        const guildRef = db.collection('guilds').doc(guildId);
        
        // Calculate expiration
        const now = Date.now();
        const expireTime = keyData.durationDays === 9999 ? 'LIFETIME' : new Date(now + keyData.durationDays * 24 * 60 * 60 * 1000);

        // Mark key as used
        await keyRef.update({
            used: true,
            usedBy: interaction.user.id,
            usedAt: new Date(),
            usedInGuild: guildId
        });

        // Upgrade server
        await guildRef.set({
            isPremium: true,
            premiumSince: new Date(),
            premiumExpire: expireTime
        }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('💎 服务器尊贵升级成功！(Supreme+)')
            .setThumbnail('https://media.giphy.com/media/xUPGcxpCV81ebhq7c0/giphy.gif')
            .setDescription(`**恭喜！** \`${interaction.guild.name}\` 已正式升级为 **TuanTuan Supreme+**！`)
            .addFields(
                { name: '✨ 激活特权', value: '• 全服经验值 (XP) 1.5倍加成\n• 解锁高阶超炫身份组自动变色\n• 音乐引擎极速 VIP 节点支持\n• 独占 Supreme 皇冠徽章', inline: false },
                { name: '⏳ 到期时间', value: expireTime === 'LIFETIME' ? '永久有效 (Lifetime)' : `<t:${Math.floor(expireTime.getTime() / 1000)}:R>`, inline: false }
            )
            .setFooter({ text: '感谢您的支持！熊猫团团正在欢呼！🐼👑' })
            .setTimestamp();

        // Send a public announcement as well
        await interaction.channel.send({ embeds: [embed] });
        await interaction.editReply('✅ 激活流程已成功完成。');
    },
};
