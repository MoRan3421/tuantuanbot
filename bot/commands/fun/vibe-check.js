const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vibe-check')
        .setDescription('📊 让团团用“大气监测仪”感应这里的氛围喵！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团正在闭上眼睛，努力感应频道里残留的小情绪喵... 🐾🍡', fetchReply: true });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 30 });
            const chatContext = messages
                .filter(m => !m.author.bot && m.content.length > 0)
                .map(m => `${m.author.username}: ${m.content}`)
                .reverse()
                .join('\n');

            if (!chatContext) {
                return interaction.editReply('❌ 呜呜，这个频道太安静了，团团感应不到任何心跳声喵！快找人聊聊天吧。');
            }
            
            const prompt = `你是一只叫"团团"的熊猫机器人助手。请根据以下最近的聊天记录，分析这个频道的"氛围感"(Vibe Check)。
            要求：
            1. 用极度可爱、软萌、第三人称的方式评价（比如：团团感应到这里充满了粉色的小泡泡喔！）。
            2. 给出一个 1-100 的"熊猫快乐分数"。
            3. 加一点熊猫、竹子、甜点相关的比喻（比如：这里甜得像一块刚出炉的草莓糯米糍！）。
            4. 保持回复在150字以内。
            
            聊天记录：
            ${chatContext}`;

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const vibeText = result.response.text() || '团团刚才不小心睡着了，只感觉到这里很温馨喵~';
            
            const scoreMatch = vibeText.match(/(\d{1,3})/);
            const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 88;

            const embed = new EmbedBuilder()
                .setColor(score > 70 ? 0xffb7c5 : score > 40 ? 0xffe4e1 : 0xb0e0e6) // Pink, MistyRose, PowderBlue
                .setTitle('📊 团团的大气监测报告 · Vibe Check')
                .setDescription(vibeText)
                .addFields(
                    { name: '🐼 熊猫快乐指数', value: `\`${score} / 100\``, inline: true },
                    { name: '🌡️ 情绪样本数', value: `\`${messages.size} 片碎碎念\``, inline: true }
                )
                .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
                .setFooter({ text: '这里的每一口空气都充满了主人的味道喵！🌸' })
                .setTimestamp();

            await interaction.editReply({ content: '报告主人！团团感应好啦，结果如下：🍢', embeds: [embed] });
        } catch (e) {
            console.error('❌ Vibe Check Failure:', e.message);
            await interaction.editReply('呜呜，这里的氛围太乱了，团团的小圆脑袋快炸掉了！(>_<) 请稍后再试。');
        }
    },
};

