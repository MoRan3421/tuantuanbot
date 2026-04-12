const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('🎰 快来挑战“团团大转盘”，赢取更多甜甜的竹子喵！✨')
        .addIntegerOption(option => 
            option.setName('bet')
                .setDescription('主人想拿多少竹子来碰碰运气呀？')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        const db = admin.firestore();
        const bet = interaction.options.getInteger('bet');

        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(interaction.user.id);
        const doc = await userRef.get();
        const data = doc.exists ? doc.data() : { bamboo: 0 };

        if ((data.bamboo || 0) < bet) {
            return interaction.reply({ content: `❌ 呜呜，主人现在只有 **${data.bamboo || 0}** 根竹子，不够玩大转盘喔！`, ephemeral: true });
        }

        const emojis = ['🎋', '🐼', '🍃', '🍢', '💎', '🌈', '🍡'];
        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

        let resultText = '';
        let isWin = false;
        let winnings = 0;
        let resultColor = 0xffe4e1; // Misty Rose

        if (slot1 === slot2 && slot2 === slot3) {
            isWin = true;
            winnings = bet * 7;
            resultText = `🎊 **哇塞！大满贯喵！7倍中奖！** 🎊\n主人获得了 **${winnings}** 根竹子！团团都惊呆了喔！`;
            resultColor = 0xffb7c5; // Pastel Pink
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            isWin = true;
            winnings = bet * 2;
            resultText = `✨ **中奖啦！2倍好运气！** ✨\n主人赢得了 **${winnings}** 根竹子喵！`;
            resultColor = 0xd0f4de; // Pastel Green
        } else {
            isWin = false;
            winnings = -bet;
            resultText = `💸 **手气稍微滑了一下喵...**\n虽然输掉了 **${bet}** 根竹子，但团团相信下次一定能赢！`;
            resultColor = 0x808080; // Gray
        }

        const finalBalance = (data.bamboo || 0) + (isWin ? winnings : winnings);
        await userRef.set({ bamboo: finalBalance }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(resultColor)
            .setTitle('🎰 团团的电玩城 · 幸运大转盘')
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setDescription(`**[ ${slot1} | ${slot2} | ${slot3} ]**\n\n${resultText}\n\n**当前余量:** ${finalBalance} 🎋`)
            .setFooter({ text: '小赌怡情，大赌伤身，多吃竹子身体好喔 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '嘿咻！转盘飞快地转起来咯... 🍡', embeds: [embed] });
    },
};

