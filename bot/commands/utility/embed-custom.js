const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('🎨 尊贵的主人特权：快来“团团DIY工坊”制作精美的卡片喵！✨'),
    premiumOnly: true,
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('embedModal')
            .setTitle('🎨 团团的卡片 DIY 工坊');

        const titleInput = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel("想给卡片起个什么好听的名字呀？")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('在这里输入卡片标题喵...')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('embedDescription')
            .setLabel("卡片里想写哪些悄悄话给朋友们呢？")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('在这里输入内容喵 (支持换行喔)...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('embedColor')
            .setLabel("主人的幸运颜色 (Hex)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('比如 #ffb7c5 (最可爱的粉色喵)')
            .setRequired(false)
            .setLength({ min: 7, max: 7 });

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);
    },
};

