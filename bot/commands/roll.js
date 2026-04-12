const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('在斜坡上滚来滚去，咕噜咕噜！🗻'),
    async execute(interaction) {
        const user = interaction.user.username;
        const rollType = Math.floor(Math.random() * 5);
        
        let response = '';
        switch(rollType) {
            case 0: response = `✨ **${user}** 团团转了几圈，把自己转晕啦！💫`; break;
            case 1: response = `🗻 **${user}** 滚下斜坡，咕噜咕噜，把竹子都撞飞啦！🎋`; break;
            case 2: response = `🐾 **${user}** 团成一个圆球，像个黑白小足球一样滚了过来！`; break;
            case 3: response = `💕 **${user}** 咕噜咕噜滚到了主人的脚边，想要个抱抱喵~`; break;
            case 4: response = `💤 **${user}** 滚着滚着就睡着了，真是个贪睡的小熊猫呢...`; break;
            default: response = `✨ **${user}** 滚来滚去，真是太开心啦！`;
        }
        await interaction.reply({ content: response });
    },
};