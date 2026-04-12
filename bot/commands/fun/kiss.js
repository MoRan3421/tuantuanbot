const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('💋 想要一个甜入心扉的熊猫式亲亲吗？✨')
        .addUserOption(option => option.setName('target').setDescription('要把这枚甜甜的吻送给谁呢？').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const response = await axios.get('https://waifu.pics/api/sfw/kiss').catch(() => null);
        const imageUrl = response ? response.data.url : 'https://media.tenor.com/F02Upn-Eos0AAAAi/panda-love.gif';

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('💋 团团快报：甜蜜蜜时刻！')
            .setDescription(`哇！**${interaction.user.username}** 羞答答地凑到 **${target.username}** 面前，给了一个“糯米糍亲亲”喵！羞羞哒~ 🌸🐾`)
            .setImage(imageUrl)
            .setFooter({ text: '周围的小泡泡都要变成粉红色了喵 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: `报告主人！<@${target.id}> 居然被告白了喵：🍢`, embeds: [embed] });
    },
};
