const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('💰 团团查账：看看主人现在存了多少好吃的竹子喵！✨'),
    async execute(interaction) {
        const db = admin.firestore();
        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(interaction.user.id);
        const doc = await userRef.get();
        const data = doc.exists ? doc.data() : { xp: 0, level: 1, bamboo: 0 };

        const embed = new EmbedBuilder()
            .setColor(0xd0f4de) // Pastel Green
            .setTitle(`🎋 ${interaction.user.username} 主人的小金库`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🍢 竹子库存', value: `\`${data.bamboo || 0}\` 根`, inline: true },
                { name: '✨ 当前成就', value: `\`LVL ${data.level || 1}\``, inline: true },
                { name: '🎖️ 茁壮值 (XP)', value: `\`${data.xp || 0} / ${(data.level || 1) * 250}\``, inline: false }
            )
            .setFooter({ text: '团团会帮主人好好管账哒！蹭蹭主人~ 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '团团飞快地跑进小金库，帮主人查到啦：🍢', embeds: [embed] });
    },
};
