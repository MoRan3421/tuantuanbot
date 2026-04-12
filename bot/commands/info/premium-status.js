const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-status')
        .setDescription('💎 看看主人们对团团的“投喂等级”喵！✨'),
    async execute(interaction) {
        const db = admin.firestore();
        const guildRef = db.collection('guilds').doc(interaction.guild.id);
        const doc = await guildRef.get();
        const data = doc.exists ? doc.data() : {};

        const isPremium = data.isPremium === true;

        if (!isPremium) {
            const basicEmbed = new EmbedBuilder()
                .setColor(0xd0f4de) // Pastel Green
                .setTitle('⚪ 普通竹子园 (Standard Tier)')
                .setDescription('当前服务器正在进行基础投喂喵。\n\n**想要解锁 1.5倍经验、超级大脑和闪亮身份吗？**')
                .addFields(
                    { name: '如何投喂更多？', value: '主人可以在官网购买“黄金竹子”激活码，然后让管理员使用 `/redeem` 喂给团团喔！' },
                    { name: '团团的零食铺', value: '[点击前往 Elite Hub 商店](https://tuantuanbot-28647.web.app)' }
                )
                .setFooter({ text: '即使只有普通竹子，团团也很开心喔！🍡' });
            return interaction.reply({ content: '报告主人！团团目前的饱食度如下：🐾', embeds: [basicEmbed] });
        }

        let expireString = '永久生效 (Lifetime) ♾️';
        if (data.premiumExpire && data.premiumExpire !== 'LIFETIME') {
            const expireDate = typeof data.premiumExpire.toDate === 'function' ? data.premiumExpire.toDate() : new Date(data.premiumExpire);
            expireString = `<t:${Math.floor(expireDate.getTime() / 1000)}:f> (距离吃完还有 <t:${Math.floor(expireDate.getTime() / 1000)}:R>)`;
        }

        const premiumEmbed = new EmbedBuilder()
            .setColor(0xFFD700) // Gold
            .setTitle('💎 黄金竹子宫殿 (Supreme+ Tier)')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`哇！\`${interaction.guild.name}\` 正在为团团提供顶级的“黄金竹子”投喂喵！`)
            .addFields(
                { name: '⭐ 黄金特权清单', value: '✅ 茁壮值获取 x1.5 倍\n✅ 双脑极速思考优先权\n✅ 专属音乐超级节点\n✅ 彩虹光标尊主称号', inline: false },
                { name: '⏳ 下次补货时间', value: expireString, inline: false }
            )
            .setFooter({ text: '感谢主人们的爱心饲养！团团吃得饱饱哒 🍡🐾' })
            .setTimestamp();

        await interaction.reply({ content: '呜哇！这里的竹子好香呀！团团吃得超级开心：🍢', embeds: [premiumEmbed] });
    },
};

