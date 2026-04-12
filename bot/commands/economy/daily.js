const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const admin = require('firebase-admin');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('🎍 每日签到领竹子！团团等主人好久啦！🌸'),
    async execute(interaction) {
        const db = admin.firestore();
        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(interaction.user.id);
        const doc = await userRef.get();
        
        const now = Date.now();
        const data = doc.exists ? doc.data() : { xp: 0, level: 1, lastCheckIn: 0, bamboo: 0 };
        
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - data.lastCheckIn < oneDay) {
            const nextCheckIn = data.lastCheckIn + oneDay;
            return interaction.reply({ content: `❌ 呜呜，主人今天已经领过竹子奖励啦！\n请在 <t:${Math.floor(nextCheckIn / 1000)}:R> 再来找团团玩喔！🐾`, ephemeral: true });
        }

        const reward = Math.floor(Math.random() * 50) + 50;
        data.bamboo = (data.bamboo || 0) + reward;
        data.lastCheckIn = now;
        data.xp = (data.xp || 0) + 50;

        await userRef.set(data, { merge: true });

        const assetPath = path.join(__dirname, '../../assets/rank/daily-reward.png');
        const attachment = new AttachmentBuilder(assetPath, { name: 'daily-reward.png' });

        const embed = new EmbedBuilder()
            .setColor(0xffffd1) // Light Yellow
            .setTitle('🎋 签到大成功！')
            .setDescription(`主人真准时！团团这就奉上今日份的奖励哒：\n\n🍢 获得 **${reward}** 根竹子 🎋\n✨ 获得 **50** 经验值 ⭐\n当前总共有 **${data.bamboo}** 根竹子喔！`)
            .setImage('attachment://daily-reward.png')
            .setFooter({ text: '团团最喜欢勤奋的主人啦！么么哒 🌸' })
            .setTimestamp();

        await interaction.reply({ content: '好哒主人！团团已经把新鲜的竹子搬过来啦！🐼', files: [attachment], embeds: [embed] });
    },
};

