const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('💕 给刚才的消息加上团团的专属可爱表情包反应！')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('选择一个表情包')
                .setRequired(true)
                .addChoices(
                    { name: '❤️ 团团爱心', value: '💖' },
                    { name: '🐼 熊猫呆住', value: '🐼' },
                    { name: '🎋 赏你竹子', value: '🎋' },
                    { name: '🔥 团团火了', value: '🔥' },
                    { name: '✅ 团团认可', value: '✅' },
                    { name: '🤣 团团笑喷', value: '🤣' },
                    { name: '✨ 团团闪光', value: '✨' }
                )),
    async execute(interaction) {
        const emoji = interaction.options.getString('emoji');
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Fetch messages excluding the current interaction if possible
            const messages = await interaction.channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first(); bonus: true;

            if (!lastMessage) return interaction.reply({ content: '❌ 团团没找到刚才的消息，没法贴贴表情包！', ephemeral: true });

            await lastMessage.react(emoji);
            await interaction.reply({ content: `✅ 团团已经在上一条消息上贴了 ${emoji} 啦！`, ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: '❌ 团团贴不上表情包，可能是我的权限不够哦！', ephemeral: true });
        }
    },
};
