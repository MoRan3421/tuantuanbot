const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('🐍 团团的森林大冒险：不仅好玩，还能大口吃竹子喵！✨'),
    async execute(interaction) {
        const db = admin.firestore();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const configRef = db.collection('guilds').doc(guildId);
        const configDoc = await configRef.get();
        const isPremium = configDoc.exists && configDoc.data().isPremium;

        const width = 10;
        const height = 10;
        const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
        let food = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
        let direction = { x: 1, y: 0 };
        let score = 0;

        const renderBoard = () => {
            let board = '';
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (snake.some(s => s.x === x && s.y === y)) board += '🟩';
                    else if (food.x === x && food.y === y) board += '🎋';
                    else board += '⬜';
                }
                board += '\n';
            }
            return board;
        };

        const getButtons = () => new ActionRowBuilder().addComponents(
             new ButtonBuilder().setCustomId('up').setLabel('⬆️').setStyle(ButtonStyle.Secondary),
             new ButtonBuilder().setCustomId('down').setLabel('⬇️').setStyle(ButtonStyle.Secondary),
             new ButtonBuilder().setCustomId('left').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
             new ButtonBuilder().setCustomId('right').setLabel('➡️').setStyle(ButtonStyle.Secondary),
             new ButtonBuilder().setCustomId('stop_snake').setLabel('🛑').setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setColor(0xd0f4de)
            .setTitle('🐍 团团的森林大冒险：贪吃蛇 ✨')
            .setDescription(renderBoard())
            .addFields({ name: '🎋 已吃竹子:', value: `\`${score}\` 根`, inline: true })
            .setFooter({ text: '键盘侠模式开启！Designed by godking512 🐾' });

        const response = await interaction.reply({ embeds: [embed], components: [getButtons()] });
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '哼，团团只听主人的命令喔！', ephemeral: true });

            if (i.customId === 'stop_snake') return collector.stop();

            if (i.customId === 'up') direction = { x: 0, y: -1 };
            if (i.customId === 'down') direction = { x: 0, y: 1 };
            if (i.customId === 'left') direction = { x: -1, y: 0 };
            if (i.customId === 'right') direction = { x: 1, y: 0 };

            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height || snake.some(s => s.x === head.x && s.y === head.y)) {
                let reward = score * (isPremium ? 3 : 2);
                if (reward > 0) {
                    const memberRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
                    await memberRef.set({ bamboo: admin.firestore.FieldValue.increment(reward) }, { merge: true });
                }

                const gameOverEmbed = new EmbedBuilder()
                    .setColor(0xffd1dc)
                    .setTitle('💀 团团撞歪了小脑袋喵！🕯️')
                    .setDescription(`主人别伤心！团团只是有点晕乎乎的...\n\n**战绩:** 吃掉了 ${score} 根竹子，化为 **${reward}** 根存入了主人的小金库喵！🎋`)
                    .setFooter({ text: 'Designed by godking512 🐾🍡' });
                await i.update({ embeds: [gameOverEmbed], components: [] });
                return collector.stop();
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score++;
                food = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
            } else {
                snake.pop();
            }

            const updatedEmbed = new EmbedBuilder()
                .setColor(0xd0f4de)
                .setTitle('🐍 团团的森林大冒险：贪吃蛇 ✨')
                .setDescription(renderBoard())
                .addFields({ name: '🎋 已吃竹子:', value: `\`${score}\` 根`, inline: true })
                .setFooter({ text: '主人加油！团团的肚子越来越圆了喔 🐾🍡' });

            await i.update({ embeds: [updatedEmbed] });
        });

        collector.on('end', () => {
             interaction.editReply({ components: [] }).catch(() => {});
        });
    },
};
