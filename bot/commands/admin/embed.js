const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-maker')
        .setDescription('🖼️ 打开嵌入消息编辑器，制作精美的公告卡片！'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('embed_modal')
            .setTitle('🎨 TuanTuan 嵌入消息编辑器');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('标题')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('输入卡片标题...')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('内容')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('输入详细的内容描述...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel('颜色 (Hex 码, 如 #ff0000)')
            .setPlaceholder('#ff9a9e')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);
    },
};
