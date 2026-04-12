const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('📊 发起一个至尊社区投票！')
        .addStringOption(option => option.setName('question').setDescription('你要问的问题').setRequired(true))
        .addStringOption(option => option.setName('options').setDescription('选项 (用逗号分隔，如：苹果,香蕉,西瓜)').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 只有“管理员”才能发起社区投票！', ephemeral: true });
        }

        const question = interaction.options.getString('question');
        const optionsList = interaction.options.getString('options').split(',').map(o => o.trim()).filter(o => o !== '');

        if (optionsList.length < 2) return interaction.reply({ content: '❌ 至少需要 2 个选项哦！', ephemeral: true });
        if (optionsList.length > 10) return interaction.reply({ content: '❌ 选项太多啦，最多支持 10 个！', ephemeral: true });

        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        let description = '';
        for (let i = 0; i < optionsList.length; i++) {
            description += `${reactions[i]} **${optionsList[i]}**\n\n`;
        }

        const embed = new EmbedBuilder()
            .setColor(0x4facfe)
            .setTitle(`📊 投票：${question}`)
            .setDescription(description)
            .setFooter({ text: `发起人: ${interaction.user.tag} | 团团至尊投票系统` })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        for (let i = 0; i < optionsList.length; i++) {
            await message.react(reactions[i]);
        }
    },
};
