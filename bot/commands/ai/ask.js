const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('🧠 向团团提问任何奇思妙想喵！✨')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('主人想问团团什么呀？')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团正在努力思考中，呆毛都要竖起来啦... 🐼🧠✨', fetchReply: true });
        const question = interaction.options.getString('question');

        const prompt = `你是一只叫"团团"的超可爱熊猫机器人助手。你的创作者是：团团熊猫游戏主播 (godking512)。
        你的性格：软萌、贴心、偶尔会卖萌（卖萌句子用喵、喔、哒结尾）。
        请用极度可爱但依然有用的方式回答以下问题。保持回复在300字以内。
        用户问题：${question}`;

        try {
            const db = admin.firestore();
            const guildDoc = await db.collection('guilds').doc(interaction.guild.id).get();
            const config = guildDoc.exists ? guildDoc.data() : { aiEngine: 'GEMINI' };
            const engine = config.aiEngine || 'GEMINI';

            let answer = '';
            let modelName = '';
            let embedColor = 0xa2d2ff;

            if (engine === 'GROQ' && process.env.Groq_Cloud_API) {
                try {
                    const Groq = require('groq-sdk');
                    const groq = new Groq({ apiKey: process.env.Groq_Cloud_API });
                    const result = await groq.chat.completions.create({
                        messages: [{ role: 'user', content: prompt }],
                        model: 'llama-3.3-70b-versatile',
                        temperature: 0.7,
                    });
                    answer = result.choices[0].message.content;
                    modelName = 'Llama-Groq ⚡';
                    embedColor = 0xb7ffec; // Pastel Mint
                } catch (e) { engine === 'GEMINI'; }
            }

            if (!answer) {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent(prompt);
                answer = result.response.text();
                modelName = 'Gemini-Flash 💎';
                embedColor = 0xa2d2ff; // Pastel Blue
            }

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`🧠 团团的回答 (${modelName})`)
                .setDescription(answer)
                .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
                .setFooter({ text: '每一句回答都是团团对主人的表白喔！🌸' })
                .setTimestamp();

            await interaction.editReply({ content: '思考好啦！主人请看：🍢', embeds: [embed] });
        } catch (e) {
            console.error('❌ Ask AI Error:', e.message);
            await interaction.editReply('呜呜，团团脑仁儿疼，想不出来啦！(>_<) 可能是竹子吃太饱了，请稍后再试喵。');
        }
    },
};
