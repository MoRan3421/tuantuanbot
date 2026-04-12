const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🧹 团团拿起小扫帚，帮主人把频道打扫得亮闪闪喵！✨')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('主人想打扫多少堆垃圾（消息）呀？(1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('🧹 团团大扫除启动中...')
            .setDescription(`正在努力搬运小竹筐，帮主人清理 **${amount}** 条消息痕迹喵...`)
            .setFooter({ text: '团团干活，主人放心 🎋🐾' });

        await interaction.reply({ embeds: [embed], ephemeral: true });

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            
            const successEmbed = new EmbedBuilder()
                .setColor(0xd0f4de) // Pastel Green
                .setTitle('✨ 打扫完成啦！')
                .setDescription(`报告主人！团团已经成功扫走了 **${deleted.size}** 堆小垃圾喵，现在频道里香喷喷的喔！`)
                .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
                .setFooter({ text: '这里的每一寸地板都亮闪闪的喵 🌸' });

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (e) {
            console.error('❌ Clear Error:', e.message);
            await interaction.editReply({ content: '❌ 呜呜，有些垃圾太重了（超过14天），或者团团力气不够（权限不足），没扫干净喵... (>_<)', embeds: [] });
        }
    },
};

