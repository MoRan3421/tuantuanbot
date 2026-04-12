const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('🎮 快来和团团在“猜拳擂台”一决胜负喵！甚至还有奖励喔 ✨'),
    async execute(interaction) {
        const db = admin.firestore();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const configRef = db.collection('guilds').doc(guildId);
        const configDoc = await configRef.get();
        const isPremium = configDoc.exists && configDoc.data().isPremium;

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5)
            .setTitle('🎮 团团的猜拳擂台')
            .setDescription('嘿咻！团团已经把肉垫藏在背后咯，请主人快快出招喵！🍢\n\n**奖励预览:**\n🏆 获胜: `20` 🎋 (Premium: `30` 🎋)\n⚖️ 平局: `5` 🎋')
            .setFooter({ text: 'Designed by godking512 · 团团电玩城 🐾🍡' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('rps_rock').setLabel('石头 ✊').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rps_paper').setLabel('布 ✋').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rps_scissors').setLabel('剪刀 ✌️').setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({ embeds: [embed], components: [row] });
        const collector = response.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '不是叫你喔！', ephemeral: true });

            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const userChoice = i.customId.split('_')[1];
            const labels = { rock: '石头 ✊', paper: '布 ✋', scissors: '剪刀 ✌️' };

            let reward = 0;
            let resultTitle = '';
            let endColor = 0xffb7c5;

            if (userChoice === botChoice) {
                resultTitle = '⚖️ 平局喵！心有灵犀一点通~ 🌸';
                reward = 5;
                endColor = 0xa2d2ff;
            } else if (
                (userChoice === 'rock' && botChoice === 'scissors') ||
                (userChoice === 'paper' && botChoice === 'rock') ||
                (userChoice === 'scissors' && botChoice === 'paper')
            ) {
                resultTitle = '🎉 呜喵！主人太厉害了！奖励一份大餐喵！🎋';
                reward = isPremium ? 30 : 20;
                endColor = 0xd0f4de;
            } else {
                resultTitle = '😈 嘿嘿！团团的小肉垫赢了喔！下次再加油喵~ 🐾🍢';
                reward = 0;
            }

            if (reward > 0) {
                const memberRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
                await memberRef.set({ bamboo: admin.firestore.FieldValue.increment(reward) }, { merge: true });
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(endColor)
                .setTitle(resultTitle)
                .addFields(
                    { name: '👤 主人出招', value: labels[userChoice], inline: true },
                    { name: '🐼 团团出招', value: labels[botChoice], inline: true },
                    { name: '🎋 获得奖励', value: `\`${reward}\` 根竹子`, inline: true }
                )
                .setFooter({ text: 'Designed by godking512 · 每一场游戏都是缘分 🐾🍡' });

            await i.update({ embeds: [resultEmbed], components: [] });
            collector.stop();
        });
    },
};
