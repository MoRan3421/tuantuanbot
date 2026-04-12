const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { askSupremeAI } = require('../../core/ai-utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-story')
        .setDescription('ðŸ“– è®©å›¢å›¢ç”¨ AI ä¸ºæ‚¨å³å…´åˆ›ä½œä¸€æ®µä¸“å±žå¾®åž‹ç«¥è¯/å†’é™©æ•…äº‹ã€‚')
        .addStringOption(option => option.setName('topic').setDescription('æ•…äº‹çš„ä¸»é¢˜æˆ–å‡ ä¸ªå…³é”®è¯ï¼Œæ¯”å¦‚ï¼šå‹‡å£«ã€å·¨é¾™ã€é¦™è•‰').setRequired(true)),
    premiumOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const topic = interaction.options.getString('topic');
        const prompt = `ä½ æ˜¯ä¸€åªå«"å›¢å›¢"çš„ç†ŠçŒ«ã€‚è¯·ç”¨å¯çˆ±çš„å£å»ï¼Œä¸ºç”¨æˆ·è®²è¿°ä¸€ä¸ªå…³äºŽã€${topic}ã€‘çš„100å­—è¶…çŸ­å°æ•…äº‹ï¼Œå¹¶åœ¨æ•…äº‹ç»“å°¾å¸¦ä¸Šä¸€ä¸ªäº’åŠ¨æé—®ã€‚`;
        
        try {
            const { text: answer, engine } = await askSupremeAI(prompt);
            const embed = new EmbedBuilder().setColor(0xffb7c5).setTitle(`ðŸ“– å›¢å›¢å¾®å°è¯´ï¼šå…³äºŽã€Œ${topic}ã€`)
                .setDescription(answer)
                .setFooter({ text: `Powered by ${engine}` }).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            await interaction.editReply('å›¢å›¢å†™ä¸å‡ºæ•…äº‹å•¦ï¼');
        }
    }
};
