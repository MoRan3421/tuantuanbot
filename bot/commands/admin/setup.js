const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-server')
        .setDescription('🏰 帮主人一键布置温馨的新家喵！(仅限群主)'),
    async execute(interaction) {
        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: '❌ 呜呜，只有服务器的主人才能下令布置新家喔！', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('🏗️ 团团的小小建筑工大行动')
            .setDescription('团团已经准备好小砖头和小刷子啦！我将为您一键生成超级温馨的频道和身份组喵~\n\n**小提醒：** 团团会增加很多新频道，建议在空房间使用喔。\n主人确定要开始了吗？🎋');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_setup')
                    .setLabel('开始装修！🚀')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_setup')
                    .setLabel('再想想喵 🐢')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '哼，团团只听主人的话！', ephemeral: true });

            if (i.customId === 'confirm_setup') {
                await i.update({ content: '🏗️ 团团正在努力搬砖中，请不要关掉团团喔... 🐼🧱✨', embeds: [], components: [] });
                
                const { guild } = i;
                
                try {
                    // Create Categories
                    const infoCat = await guild.channels.create({ name: '📢 | 团团告示牌', type: ChannelType.GuildCategory });
                    const chatCat = await guild.channels.create({ name: '💬 | 零食聊天屋', type: ChannelType.GuildCategory });
                    const voiceCat = await guild.channels.create({ name: '🔊 | 熊猫树洞', type: ChannelType.GuildCategory });
                    const staffCat = await guild.channels.create({ name: '🛠️ | 团团值班间', type: ChannelType.GuildCategory });

                    // Create Channels
                    await guild.channels.create({ name: '欢迎团团', parent: infoCat.id });
                    const rules = await guild.channels.create({ name: '我们的约定', parent: infoCat.id });
                    await guild.channels.create({ name: '快乐水闲聊', parent: chatCat.id });
                    await guild.channels.create({ name: '团团点歌台', parent: chatCat.id });
                    await guild.channels.create({ name: '云朵沙发区', type: ChannelType.GuildVoice, parent: voiceCat.id });

                    // Write Rules
                    const rulesEmbed = new EmbedBuilder()
                        .setColor(0xffb7c5)
                        .setTitle('🎋 团团与主人们的小约定')
                        .setDescription('1. 严禁凶巴巴的喷人引战，团团会哭哒！\n2. 每天都要保持可爱，多来找团团玩喵。\n3. 不要一直刷屏，团团的小眼睛会看花的！\n4. 管理员是大熊猫，团团是二熊猫，都要听话喔！');
                    await rules.send({ embeds: [rulesEmbed] });

                    // Create Roles
                    await guild.roles.create({ name: '团团的VIP挚友 🍡', color: 0xFFB7C5, reason: 'TuanTuan Setup' });
                    await guild.roles.create({ name: '团团的小保安 🛡️', color: 0xA2D2FF, reason: 'TuanTuan Setup' });

                    await i.editReply({ content: '✅ 装修大功告成！主人的新家已经布置得漂漂亮亮啦！🐼💖🍢' });
                } catch (e) {
                    console.error(e);
                    await i.editReply({ content: '❌ 呜呜，装修遇到困难了，主人请确认团团有“管理员”权限喵！🐾' });
                }
            } else {
                await i.update({ content: '好哒，团团先把小刷子收起来，等主人的命令！🐢', embeds: [], components: [] });
            }
        });
    },
};

