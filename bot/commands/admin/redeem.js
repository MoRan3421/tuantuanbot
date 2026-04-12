const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('🎟️ 激活本服务器的 TuanTuan Supreme+ 尊贵版本')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('key')
                .setDescription('请输入 TuanTuan Supreme+ 激活码')
                .setRequired(true)),
    async execute(interaction) {
        const keyText = interaction.options.getString('key').trim().toUpperCase();
        const db = admin.firestore();
        
        await interaction.deferReply({ ephemeral: true });

        const keyRef = db.collection('premium_keys').doc(keyText);
        const keyDoc = await keyRef.get();

        if (!keyDoc.exists || keyDoc.data().used) {
            return interaction.editReply({ content: '❌ 无效或已被使用的激活码！请联系开发者获取正版授权。' });
        }

        const durationDays = keyDoc.data().durationDays;
        const guildId = interaction.guild.id;

        // Calculate expiration date
        let expireDate = new Date();
        if (durationDays === 9999) {
            expireDate = 'LIFETIME';
        } else {
            expireDate.setDate(expireDate.getDate() + durationDays);
        }

        // Update guild data
        await db.collection('guilds').doc(guildId).set({
            isPremium: true,
            premiumExpire: expireDate,
            premiumSince: new Date()
        }, { merge: true });

        // Mark key as used
        await keyRef.update({
            used: true,
            usedBy: interaction.user.id,
            usedIn: guildId,
            usedAt: new Date()
        });

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🎋 TuanTuan Supreme+ 激活成功！')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`恭喜！您的服务器 \`${interaction.guild.name}\` 已成功升级为最高优先级 Supreme+ 架构。`)
            .addFields(
                { name: '⭐ 您已获得特权', value: '✅ 1.5倍经验获取\n✅ AI处理器零等待\n✅ 专属音乐超级节点\n✅ 用户昵称全域同步' },
                { name: '⏳ 时效性', value: durationDays === 9999 ? '永久有效 (Lifetime) ♾️' : `${durationDays} 天`, inline: true }
            )
            .setFooter({ text: 'Supreme Elite Hub 3.0' })
            .setTimestamp();

        await interaction.editReply({ content: '✅ 激活成功！', embeds: [embed] });
        
        // Notify the channel
        const channel = interaction.channel;
        if (channel) {
            await channel.send({ 
                content: `🎊 热烈庆祝本服务器成功激活 **TuanTuan Supreme+**！熊猫管家在此感谢各位的赞助与支持！🐼🎀`,
                embeds: [embed]
            }).catch(() => {});
        }
    },
};
