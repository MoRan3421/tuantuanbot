const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 看看这个服务器里哪些小伙伴最厉害哒！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '报告主人！团团正在努力搬运“至尊英雄榜”，请稍等一下喔！🐾🍡', fetchReply: true });

        const db = admin.firestore();
        const usersRef = db.collection('guilds').doc(interaction.guild.id).collection('members');
        const snapshot = await usersRef.orderBy('xp', 'desc').limit(10).get();

        if (snapshot.empty) {
            return interaction.editReply('❌ 呜呜，这里还没有小伙伴开始探险呢，主人快带大家聊起来哒！🐼');
        }

        let leaderboardString = '';
        let rankOrder = 1;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const user = await interaction.client.users.fetch(doc.id).catch(() => ({ username: '神秘熊猫' }));
            const medal = rankOrder === 1 ? '🥇' : rankOrder === 2 ? '🥈' : rankOrder === 3 ? '🥉' : '🐾';
            const levelStr = `\`Lv.${data.level || 1}\``;
            const title = data.level > 10 ? '🐼 熊猫长老' : '🍼 熊猫宝宝';
            leaderboardString += `${medal} **No.${rankOrder}** — ${user.username}\n╰┈➤ ${levelStr} · ✨ \`${data.xp} XP\` · 称号: \`${title}\`\n\n`;
            rankOrder++;
        }

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle(`🏆 ${interaction.guild.name} · 团团至尊英雄榜`)
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setDescription(leaderboardString)
            .setFooter({ text: '这些小伙伴都在团团的照顾下壮大啦！🍢 | Designed by godking512 with love' })
            .setTimestamp();

        await interaction.editReply({ content: '噔噔蹬蹬！这就是现在的排名情况喔：', embeds: [embed] });
    },
};


