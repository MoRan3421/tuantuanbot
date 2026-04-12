const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('📩 获取团团的邀请函，带团团回家喵！✨'),
    async execute(interaction) {
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('📩 带团团回家吧！🌸')
            .setDescription(`主人想带团团去新的地方玩吗？点击下方就可以啦：\n\n[✨ 点击把团团抱走呀](${inviteUrl})\n\n团团会一直乖乖听主人的话喔！🐼💖`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: '团团已经在收拾行李了喔~ 🍡' });

        await interaction.reply({ content: '好哒主人！这是团团的专属直通车喔：', embeds: [embed] });
    },
};

