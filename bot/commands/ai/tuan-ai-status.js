const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tuan-ai-status')
        .setDescription('🧠 帮团团做个“大脑体检”，看看运行得快不快！✨'),
    async execute(interaction) {
        await interaction.reply({ content: '好哒主人！团团这就给自己做个全身检查，请稍等喵~ 🐾🩹', fetchReply: true });
        const startTime = Date.now();

        // Test Gemini speed
        let geminiStatus = '❌ 离线中...';
        let geminiLatency = '--';
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const gs1 = Date.now();
            await model.generateContent('Reply with: OK');
            geminiLatency = `${Date.now() - gs1}ms`;
            geminiStatus = '✅ 充满活力！';
        } catch (e) {
            geminiStatus = `⚠️ 哎呀: ${e.message.substring(0, 30)}...`;
        }

        // Test Groq speed
        let groqStatus = '❌ 睡着了...';
        let groqLatency = '--';
        if (process.env.Groq_Cloud_API) {
            try {
                const Groq = require('groq-sdk');
                const groq = new Groq({ apiKey: process.env.Groq_Cloud_API });
                const gs2 = Date.now();
                await groq.chat.completions.create({
                    messages: [{ role: 'user', content: 'OK' }],
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 5,
                });
                groqLatency = `${Date.now() - gs2}ms`;
                groqStatus = '✅ 极速冲刺！';
            } catch (e) {
                groqStatus = `⚠️ 故障喵: ${e.message.substring(0, 30)}...`;
            }
        }

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor(0xa2d2ff) // Pastel Blue
            .setTitle('🧠 团团的大脑体检报告 · Kawaii Health')
            .setDescription('团团正在努力保持清醒，为您提供最棒的服务喔！🌸')
            .addFields(
                { name: '💎 Gemini 脑细胞', value: `状态: \`${geminiStatus}\`\n延迟: \`${geminiLatency}\``, inline: true },
                { name: '⚡ Groq 脑细胞', value: `状态: \`${groqStatus}\`\n延迟: \`${groqLatency}\``, inline: true },
                { name: '⏱️ 陪主人的时间', value: `\`${hours}小时 ${minutes}分钟\``, inline: true },
                { name: '💾 脑袋重量 (RAM)', value: `\`${memUsage} MB\``, inline: true },
                { name: '📡 全身反应速度', value: `\`${Date.now() - startTime}ms\``, inline: true },
                { name: '🤖 核心魔法版本', value: `\`Node ${process.version}\``, inline: true }
            )
            .setFooter({ text: '团团会一直加油变聪明的！🐾🍡' })
            .setTimestamp();

        await interaction.editReply({ content: '检查完毕！团团今天也很健康喔：🍢', embeds: [embed] });
    },
};
