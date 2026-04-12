const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('switch-ai')
        .setDescription('🧠 帮团团换一颗聪明的“小脑袋”喵！✨')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('engine')
                .setDescription('哪颗脑袋比较好使呢？')
                .setRequired(true)
                .addChoices(
                    { name: 'Google Gemini (温柔全能型 💎)', value: 'gemini' },
                    { name: 'Groq Llama (极速快嘴型 ⚡)', value: 'groq' }
                )
        ),
    async execute(interaction) {
        const engine = interaction.options.getString('engine');
        const db = admin.firestore();
        
        await db.collection('guilds').doc(interaction.guild.id).set({
            aiEngine: engine.toUpperCase()
        }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(engine === 'gemini' ? 0xa2d2ff : 0xb7ffec) // Pastel Blue or Mint
            .setTitle('🧠 脑袋切换成功啦！✨')
            .setDescription(`团团现在觉得脑袋瓜热乎乎的，正在努力适应 **${engine === 'gemini' ? 'Google Gemini 💎' : 'Groq Llama ⚡'}** 呢！`)
            .addFields(
                { name: '💎 Gemini 脑袋', value: '思考很深刻，是个温柔的博学者喔~', inline: true },
                { name: '⚡ Groq 脑袋', value: '说话超级快，是个急性子的小天才！', inline: true }
            )
            .setFooter({ text: '不管哪颗脑袋，团团都最爱主人啦！🌸' })
            .setTimestamp();

        await interaction.reply({ content: '好哒主人！团团已经顺利完成“换脑手术”咯！🍡🐾', embeds: [embed] });
    },
};

