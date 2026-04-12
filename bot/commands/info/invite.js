const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('📩 获取团团的官方邀请链接与服务器邀请！'),
    async execute(interaction) {
        // Bot Invite
        const botInvite = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        
        // Server Invite
        let serverInvite = '无法创建（权限不足）';
        try {
            const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 0 });
            serverInvite = invite.url;
        } catch (e) { console.log('Invite creation failed'); }

        const embed = new EmbedBuilder()
            .setColor(0xff9a9e)
            .setTitle('📩 团团邀请中心')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🤖 邀请团团到你的服务器', value: `[点击这里一键邀请](${botInvite})` },
                { name: '🏰 分享此服务器', value: serverInvite }
            )
            .setFooter({ text: '团团期待去更多新家看看！🐼💖' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('一键邀请团团 🐼')
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInvite)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
