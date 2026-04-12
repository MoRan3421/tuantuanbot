const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const admin = require('firebase-admin');
const { generateRankCard } = require('../../utils/rank-card');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('🏆 让团团给主人展示美美的等级卡片！✨')
        .addUserOption(option => option.setName('target').setDescription('想看哪个小伙伴的排名喵？')),
    async execute(interaction) {
        await interaction.deferReply(); // Generating images can take time 🐾
        
        const user = interaction.options.getUser('target') || interaction.user;
        const db = admin.firestore();
        
        // Fetch User Data from this Guild
        const userRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);
        const doc = await userRef.get();
        const data = doc.exists ? doc.data() : { xp: 0, level: 1, bamboo: 0 };
        
        try {
            // Generate the beautiful rank card image! 🎨
            const buffer = await generateRankCard(user, data);
            const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });

            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle(`🏆 ${user.username} 主人的至尊身份卡`)
                .setDescription(`主人真棒！现在的等级是 **第 ${data.level || 1} 级** 喔！✨`)
                .setImage('attachment://rank-card.png')
                .setFooter({ text: '团团在努力记录主人的每一步进步哒！🐾' })
                .setTimestamp();

            await interaction.editReply({ files: [attachment], embeds: [embed] });
        } catch (error) {
            console.error('Rank Card Error:', error);
            await interaction.editReply('呜呜... 团团没能画出主人的卡片，请稍后再试喵... 🐾');
        }
    },
};
