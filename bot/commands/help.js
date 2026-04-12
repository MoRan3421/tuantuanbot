const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📖 翻开团团的超萌交互手册喵！✨'),
    async execute(interaction) {
        const categories = {
            ai: {
                label: '🧠 团团的聪明大脑 (AI)',
                description: '问问团团这个世界的小秘密吧~',
                embed: new EmbedBuilder()
                    .setColor(0xb7ffc5) // Pastel Mint Green
                    .setTitle('🧠 团团的大脑正在高速运转...')
                    .setDescription('团团现在可是拥有 Gemini 💎 和 Groq ⚡ 两颗聪明脑袋的小熊猫喔！')
                    .addFields(
                        { name: '/ask', value: '和团团聊天聊天 🐼', inline: true },
                        { name: '/ai-summarize', value: '团团帮主人划重点！', inline: true },
                        { name: '/switch-ai', value: '帮团团换另一颗脑袋 ⚙️', inline: true }
                    )
                    .setFooter({ text: '每一句回答都是团团对主人的爱喔！🌸' })
            },
            music: {
                label: '🎶 小熊猫的随身听 (Music)',
                description: '来和团团一起听听好听的音乐吧！',
                embed: new EmbedBuilder()
                    .setColor(0xffb7c5) // Pastel Pink
                    .setTitle('🎶 团团的小卡带')
                    .setDescription('不管是 YT 还是 Spotify，团团都能唱给主人听喔！')
                    .addFields(
                        { name: '/play', value: '播放想要听的歌 🎵', inline: true },
                        { name: '/stop / skip', value: '控制音乐进度 🐾', inline: true },
                        { name: '/queue / lyrics', value: '查看歌单与歌词 🎶', inline: true }
                    )
                    .setFooter({ text: '音乐让团团也想跳舞了呢！🐾' })
            },
            economy: {
                label: '🏆 竹林大冒险 (Eco & Levels)',
                description: '采摘新鲜竹子，看看排名卡片~',
                embed: new EmbedBuilder()
                    .setColor(0xd0f4de) // Pastel Green
                    .setTitle('💰 团团的竹子存储库')
                    .setDescription('每一份努力，团团都记在心里呢！')
                    .addFields(
                        { name: '/profile', value: '主人的至尊美照合集 🎴', inline: true },
                        { name: '/rank / level', value: '主人的排位卡片 📊', inline: true },
                        { name: '/daily / pay', value: '收集与分发竹子 🎋', inline: true },
                        { name: '/leaderboard', value: '至尊熊猫英雄榜 🏆', inline: true }
                    )
                    .setFooter({ text: '多吃竹子身体好！🍡' })
            },
            fun: {
                label: '🧸 零食聊天屋 (Fun)',
                description: '和团团一起玩耍互动喵！',
                embed: new EmbedBuilder()
                    .setColor(0xffffd1) // Pastel Yellow
                    .setTitle('🧸 团团的快乐时光')
                    .setDescription('在这里，每一秒都很甜喔！')
                    .addFields(
                        { name: '/action', value: '超可爱的互动大合集 🫂', inline: true },
                        { name: '/panda', value: '看看团团的那些亲戚 🐼', inline: true },
                        { name: '/slap / kiss', value: '拍拍与亲亲 💋', inline: true },
                        { name: '/vibe-check', value: '测测今天的心情 🌸', inline: true }
                    )
                    .setFooter({ text: 'Designed by godking512 · 快乐满分！🐾' })
            },
            games: {
                label: '🎮 团团游乐场 (Games)',
                description: '快来挑战各种趣味游戏吧！',
                embed: new EmbedBuilder()
                    .setColor(0xa2d2ff) // Pastel Blue
                    .setTitle('🎮 团团的电玩城')
                    .setDescription('主人的游戏细胞觉醒了吗？')
                    .addFields(
                        { name: '/slots', value: '团团大转盘 🎰', inline: true },
                        { name: '/snake', value: '森林寻找竹子 🐍', inline: true },
                        { name: '/rps', value: '石头剪刀布竞技场 ⚔️', inline: true },
                        { name: '/guess-number', value: '心有灵犀大考验 🎲', inline: true }
                    )
                    .setFooter({ text: '每场游戏都是一段美好的回忆喵！🍡' })
            },
            admin: {
                label: '🛡️ 团团的小保安 (Admin)',
                description: '这里的规矩，团团来守护！',
                embed: new EmbedBuilder()
                    .setColor(0xffd1dc) // Soft Pink
                    .setTitle('🛡️ 团团竖起小耳朵值班中')
                    .setDescription('高效管理，让这里变得更温馨！')
                    .addFields(
                        { name: '/setup-server', value: '一键布置新家 🏰', inline: true },
                        { name: '/clear / set-prefix', value: '基础管理设置 🔧', inline: true },
                        { name: '/kick / ban / mute', value: '请不乖的人出门 👢', inline: true }
                    )
                    .setFooter({ text: '守护最好的主人们！🛡️' })
            }
        };


        const mainEmbed = new EmbedBuilder()
            .setColor(0xffb7c5)
            .setTitle('📖 团团的秘密手册 · Kawaii Edition')
            .setDescription('**欢迎光临团团的小屋！(✿◡‿◡)**\n\n我是主人最贴心的小助手团团。请在下方选项框中选择一个**神奇分类**，团团会为您详细介绍喔！\n\n**[🍡 升级到高级版]** 还可以解锁更多羞涩又好玩的交互特效喔！')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🌐 团团的线上乐园', value: '[点击进入 Elite Hub](https://tuantuanbot-28647.web.app)', inline: true },
                { name: '💕 我的好主人', value: 'godking512 (团团熊猫主播)', inline: true }
            )
            .setFooter({ text: 'Made with love & bamboo by godking512 🐼' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_select')
            .setPlaceholder('主人想看哪个分类喵？...')
            .addOptions(Object.keys(categories).map(key => ({
                label: categories[key].label,
                description: categories[key].description,
                value: key
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);
        
        const linkRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('进入我的小屋 🌐')
                .setStyle(ButtonStyle.Link)
                .setURL('https://tuantuanbot-28647.web.app'),
            new ButtonBuilder()
                .setLabel('带我回家 📩')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
        );

        const response = await interaction.reply({ 
            embeds: [mainEmbed], 
            components: [row, linkRow] 
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect,
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: '❌ 呜呜，只有刚才喊团团的主人才能操作喔！', ephemeral: true });
            }

            const selection = i.values[0];
            const category = categories[selection];

            await i.update({ 
                embeds: [category.embed], 
                components: [row, linkRow] 
            });
        });

        collector.on('end', () => {
            selectMenu.setDisabled(true);
            interaction.editReply({ components: [row, linkRow] }).catch(() => null);
        });
    },
};

