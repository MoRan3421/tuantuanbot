const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

async function askSupremeAI(prompt, engine = 'GEMINI') {
    const normalizedEngine = String(engine || 'GEMINI').toUpperCase();
    const groqKey = process.env.Groq_Cloud_API || process.env.GROQ_API_KEY;

    if (normalizedEngine === 'GROQ' && groqKey) {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const result = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
            });
            return { text: result.choices[0].message.content, engine: 'Groq ⚡' };
        } catch (e) {
            console.error('Groq Error:', e.message);
            // Fallback to Gemini
        }
    }

    // Default: Gemini
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return { text: result.response.text(), engine: 'Gemini 💎' };
    } catch (e) {
        console.error('Gemini Error:', e.message);
        throw new Error('All AI engines failed.');
    }
}

module.exports = { askSupremeAI };
