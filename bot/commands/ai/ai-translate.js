const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { askSupremeAI } = require('../../core/ai-utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-translate')
        .setDescription('🌐 团团首席翻译官！附带熊猫萌音翻译。')
        .addStringOption(option => option.setName('text').setDescription('要翻译的文本').setRequired(true))
        .addStringOption(option => option.setName('target').setDescription('目标语言 (默认英文)').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const text = interaction.options.getString('text');
        const lang = interaction.options.getString('target') || '英语';
        const prompt = `请将以下文本翻译成 ${lang}。在翻译完毕后，用一只叫团团的可爱的熊猫身份用中文评价一下这句话（不要超过30个字）。\n\n文本：${text}`;
        
        try {
            const { text: answer, engine, color } = await askSupremeAI(prompt);
            const embed = new EmbedBuilder().setColor(color).setTitle(`🌐 翻译至 ${lang}`)
                .setDescription(`**原文：**\n${text}\n\n**译文与评价：**\n${answer}`)
                .setFooter({ text: `Powered by ${engine}` }).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            await interaction.editReply('团团翻译失败啦！');
        }
    }
};
