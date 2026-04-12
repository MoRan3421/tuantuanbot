const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { askSupremeAI } = require('../../core/ai-utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-roast')
        .setDescription('🔥 团团开启“小奶音”吐槽模式！快来挨骂（划掉）喵~')
        .addUserOption(option => option.setName('target').setDescription('让团团吐槽谁呢？(默认吐槽你自己)').setRequired(false)),
    async execute(interaction) {
        await interaction.reply({ content: '嘿嘿，团团正在酝酿一些“狠话”喔... 🎋🔥', fetchReply: true });
        const target = interaction.options.getUser('target') || interaction.user;
        const prompt = `你是一只叫"团团"的可爱熊猫。你现在在进行“小奶音吐槽”。你的任务是犀利又俏皮、奶里奶气地吐槽 "${target.username}"。要有萌点，让人觉得你是在撒娇式嫌弃。不超过80字。`;
        
        try {
            const { text: answer, engine } = await askSupremeAI(prompt);
            const embed = new EmbedBuilder()
                .setColor(0xffd1dc) // Pastel Pink/Red
                .setTitle(`🔥 团团的奶音锐评：${target.username}`)
                .setDescription(answer)
                .setThumbnail(target.displayAvatarURL())
                .setFooter({ text: `脑袋引擎: ${engine} | 吐槽也是一种爱喔 🌸` })
                .setTimestamp();
            await interaction.editReply({ content: '呜哇！团团一不小心说真心话了：🍢', embeds: [embed] });
        } catch (e) {
            await interaction.editReply('团团今天不想做坏孩子，不想吐槽啦！🐾');
        }
    }
};

