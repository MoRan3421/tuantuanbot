const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('💢 团团的小肉垫也是很有力气的小表情喵！✨')
        .addUserOption(option => option.setName('target').setDescription('派谁去受这一招“小肉垫攻击”呢？').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const response = await axios.get('https://waifu.pics/api/sfw/slap').catch(() => null);
        const imageUrl = response ? response.data.url : 'https://media.giphy.com/media/Zau0yrl17uzdEXfTj5/giphy.gif';

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('💢 团团快报：小肉垫攻击！')
            .setDescription(`**${interaction.user.username}** 假装生气地对 **${target.username}** 使出了“娇嗔小肉垫”，这就是爱的教育喵！🐾🍡`)
            .setImage(imageUrl)
            .setFooter({ text: '被打一下也不会痛，因为这是爱的味道喵 🌸' })
            .setTimestamp();

        await interaction.reply({ content: `报告主人！<@${target.id}> 刚才被偷拍到了这个瞬间：🍢`, embeds: [embed] });
    },
};
