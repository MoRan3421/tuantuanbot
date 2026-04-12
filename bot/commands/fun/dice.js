const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('🎲 让团团用小肉垫帮主人投个骰子，看看今天的运气喵！✨')
        .addIntegerOption(option => 
            option.setName('sides').setDescription('主人想要多少面的骰子呀？(默认6)').setMinValue(2).setMaxValue(100)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        
        const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const icon = sides === 6 ? (diceIcons[result - 1] || '🎲') : '🎲';

        let luck;
        let embedColor = 0xa2d2ff; // Pastel Blue

        if (result === sides) {
            luck = '🌟 超级大锦鲤！主人一定是吃过好吃的竹子了喵！';
            embedColor = 0xffd700; // Gold
        } else if (result === 1) {
            luck = '🌧️ 唔... 下雨了喵。没关系的，团团给主人撑伞！';
            embedColor = 0x808080; // Gray
        } else if (result > sides * 0.7) {
            luck = '✨ 闪亮亮！运气正在向主人招手喔！';
            embedColor = 0xffb7c5; // Pastel Pink
        } else if (result > sides * 0.3) {
            luck = '🍡 平平淡淡才是真，吃口团子休息下喵~';
            embedColor = 0xd0f4de; // Pastel Green
        } else {
            luck = '😅 哎呀，有一点点小波折喵。团团帮你加油！';
            embedColor = 0xffe4e1; // Misty Rose
        }

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${icon} 团团的命运骰子`)
            .setDescription(`主人投出了一个 **${sides}** 面骰喵！`)
            .addFields(
                { name: '🎯 幸运点数', value: `\`# ${result}\``, inline: true },
                { name: '🔮 锦鲤指数', value: luck, inline: true }
            )
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setFooter({ text: '无论结果如何，团团都会一直陪着主人喵 🐾🍡' })
            .setTimestamp();

        await interaction.reply({ content: '嘿咻！团团闭上眼睛用力投出去咯... 🍢', embeds: [embed] });
    },
};

