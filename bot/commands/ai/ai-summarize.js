const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { askSupremeAI } = require('../../core/ai-utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-summarize')
        .setDescription('📝 字太多了不想看？团团帮主人划重点哒！✨')
        .addStringOption(option => option.setName('text').setDescription('要团团看的好长好长的话~').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const text = interaction.options.getString('text');
        const prompt = `主人发了一段好长的话，请用三个超级可爱的要点帮主人总结一下，语气要软糯糯的，像是一个一直在卖萌的小熊猫：\n\n${text}`;
        
        try {
            const { text: answer, engine } = await askSupremeAI(prompt);
            const embed = new EmbedBuilder()
                .setColor(0xffd1dc) // Pastel Pink
                .setTitle('📝 团团的小本本划重点')
                .setDescription(answer)
                .setFooter({ text: `团团的大脑：${engine} · 么么哒 🌸` })
                .setTimestamp();
            await interaction.editReply({ content: '好哒主人！团团已经看完了，这些是重点喔：', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('呜呜... 团团的脑袋突然卡住了，没能总结出来，对不起主人... 🐾');
        }
    }
};

