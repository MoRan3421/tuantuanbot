if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '../.env' });
}
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { Player } = require('discord-player');
const express = require('express');

// --- FIREBASE ADMIN ---
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });
}
const db = admin.firestore();

const { askSupremeAI } = require('./core/ai-utils');

async function getAIResponse(prompt, guildId = 'global') {
    try {
        const db = admin.firestore();
        let engine = 'GEMINI';
        try {
            const guildDoc = await db.collection('guilds').doc(guildId).get();
            if (guildDoc.exists && guildDoc.data().aiEngine) {
                engine = String(guildDoc.data().aiEngine).toUpperCase();
            }
        } catch (dbErr) {
            console.error('Firebase DB Error in AI fetch (fallback to GEMINI):', dbErr.message);
        }
        
        const { text } = await askSupremeAI(prompt, engine);
        return text;
    } catch (e) {
        console.error('❌ AI Core Failure:', e.message);
        return '团团脑仁儿疼，可能 API 出错啦！(>_<)';
    }
}

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Firebase Auth Middleware
async function verifyUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (e) {
        res.status(403).send('Forbidden');
    }
}

app.get('/', (req, res) => res.send('TuanTuan Supreme Core is Online 🍵'));
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- STRIPE COYOUT SESSION ---
app.post('/api/stripe/create-checkout-session', verifyUser, async (req, res) => {
    const { guildId, plan } = req.body;
    const priceId = plan === 'lifetime' ? process.env.STRIPE_LIFETIME_PRICE : process.env.STRIPE_MONTHLY_PRICE;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `${process.env.WEB_URL}/success?guildId=${guildId}`,
            cancel_url: `${process.env.WEB_URL}/cancel`,
            metadata: { guildId, type: 'premium_upgrade' }
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- PREMIUM REDEEM ---
app.post('/api/premium/redeem', verifyUser, async (req, res) => {
    const { guildId, key } = req.body;
    const db = admin.firestore();

    try {
        const keyRef = db.collection('premium_keys').doc(key);
        const keyDoc = await keyRef.get();

        if (!keyDoc.exists || keyDoc.data().used) {
            return res.status(400).json({ error: '无效或已被领取的激活码 (QAQ)' });
        }

        await db.runTransaction(async (t) => {
            t.update(keyRef, { used: true, usedBy: req.user.uid, usedIn: guildId, usedAt: admin.firestore.FieldValue.serverTimestamp() });
            t.set(db.collection('guilds').doc(guildId), { isPremium: true, premiumSince: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- STRIPE WEBHOOK ---
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const guildId = session.metadata.guildId;
        const db = admin.firestore();
        
        await db.collection('guilds').doc(guildId).set({
            isPremium: true,
            premiumSince: admin.firestore.FieldValue.serverTimestamp(),
            lastPaymentId: session.payment_intent
        }, { merge: true });

        console.log(`💎 Premium activated for Guild: ${guildId}`);
    }
    res.json({ received: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Elite Web API activated on port ${port}`);
});

// --- CORE BOT LOGIC ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ] 
});

// --- DISCORD-PLAYER V7 ASYNC INIT ---
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

// Command loader
client.commands = new Collection();
const loadCommands = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
        }
    }
};

const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });
loadCommands(commandsPath);
const commands = [];
for (const command of client.commands.values()) {
    try {
        if (command.data && typeof command.data.toJSON === 'function') {
            commands.push(command.data.toJSON());
        }
    } catch (e) {
        console.error(`❌ Failed to serialize command "${command.data.name}":`, e.message);
    }
}

// Caching & Persistence
const guildConfigs = new Map();
const DEFAULT_PREFIX = '!';

async function getGuildConfig(guildId) {
    if (guildConfigs.has(guildId)) return guildConfigs.get(guildId);
    const defaultConfig = { prefix: DEFAULT_PREFIX, aiChannelId: null, isPremium: false, rainbowRoleId: null, aiEngine: 'GEMINI' };
    try {
        const docRef = db.collection('guilds').doc(guildId);
        const doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set(defaultConfig);
            guildConfigs.set(guildId, defaultConfig);
            return defaultConfig;
        }
        const data = Object.assign({}, defaultConfig, doc.data());
        guildConfigs.set(guildId, data);
        return data;
    } catch (err) {
        console.error('Firebase DB Error in getGuildConfig:', err.message);
        return defaultConfig; // Fallback so commands don't crash everything!
    }
}

// XP & Leveling Logic
const userXpCache = new Map();
async function giveXpAndRewards(guildId, userId, providedXp = null, providedBamboo = 0) {
    try {
        const key = `${guildId}-${userId}`;
        const now = Date.now();
        if (!providedXp && userXpCache.has(key) && now - userXpCache.get(key) < 60000) return null;
        if (!providedXp) userXpCache.set(key, now);

        const docRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
        const doc = await docRef.get();
        let data = doc.exists ? doc.data() : { xp: 0, level: 1, bamboo: 0 };
        
        // Config for bonus
        const guildConfig = await getGuildConfig(guildId);
        const multiplier = guildConfig.isPremium ? 1.5 : 1;

        const xpToAdd = providedXp || (Math.floor(Math.random() * 15) + 10);
        const finalXpGain = Math.ceil(xpToAdd * multiplier);
        const finalBambooGain = Math.ceil(providedBamboo * multiplier);

        data.xp = (data.xp || 0) + finalXpGain;
        data.bamboo = (data.bamboo || 0) + finalBambooGain;

        let leveledUp = false;
        const nextLevelXp = (data.level || 1) * 250; 
        if (data.xp >= nextLevelXp) {
            data.level = (data.level || 1) + 1;
            data.xp = 0;
            leveledUp = true;
        }

        await docRef.set(data, { merge: true });
        return leveledUp ? data.level : null;
    } catch (e) {
        console.error('❌ Interaction XP Error:', e.message);
        return null;
    }
}

client.once('ready', async () => {
    // ASYNC EXTRACTOR LOAD (Required for V7)
    console.log('🤖 正在加载音乐引擎...');
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors).catch(console.error);
    
    console.log(`🐼 团团 Kawaii Core 启动成功！已上线为：${client.user.tag}`);
    client.user.setActivity('在竹林里打滚喵 | /help', { type: ActivityType.Playing });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    // --- REAL-TIME GLOBAL SYNC (NICKNAME & MODULES) ---
    console.log('🔗 开启云端实时同步引擎...');
    db.collection('guilds').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'modified') {
                const guildId = change.doc.id;
                const data = change.doc.data();
                const guild = client.guilds.cache.get(guildId);
                if (guild && data.nickname) {
                    const me = guild.members.me;
                    if (me && me.nickname !== data.nickname) {
                        try { await me.setNickname(data.nickname); } catch (e) {}
                    }
                }
            }
        });
    });

    // --- STARTUP NICKNAME SYNC ---
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const guildConfig = await getGuildConfig(guildId);
            if (guildConfig.nickname) {
                const me = guild.members.me;
                if (me && me.nickname !== guildConfig.nickname) {
                    await me.setNickname(guildConfig.nickname).catch(() => {});
                }
            }
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
            console.log(`Successfully synced ${guild.name} (${guildId})`);
        } catch (error) { 
            console.error(`Failed to sync ${guildId}:`, error.message); 
        }
    }

    // --- AI CHANNEL AUTO-REPLY ---
    const syncProfile = async () => {
        try {
            // 1. Global Sync
            const globalProfile = await db.collection('config').doc('global_profile').get();
            if (globalProfile.exists) {
                const data = globalProfile.data();
                if (data.status) client.user.setActivity(data.status, { type: ActivityType.Playing });
            }

            // 2. Per-Server Nickname Sync
            for (const [guildId, guild] of client.guilds.cache) {
                const guildProfile = await db.collection('guilds').doc(guildId).collection('profile').doc('settings').get();
                if (guildProfile.exists) {
                    const data = guildProfile.data();
                    if (data.nickname) {
                        const me = guild.members.me;
                        if (me && me.nickname !== data.nickname) await me.setNickname(data.nickname).catch(() => {});
                    }
                }

                // Rainbow Role Sync (Existing)
                const config = await getGuildConfig(guildId);
                if (config.rainbowRoleId) {
                    const role = guild.roles.cache.get(config.rainbowRoleId);
                    if (role) {
                        const colors = [0xFF0000, 0xFFA500, 0xFFFF00, 0x008000, 0x0000FF, 0x4B0082, 0xEE82EE];
                        await role.setColor(colors[Math.floor(Math.random() * colors.length)]).catch(() => {});
                    }
                }
            }
        } catch (e) {
            console.error('❌ Profile Sync Error:', e.message);
        }
    };

    setInterval(syncProfile, 60000);
    syncProfile();
});

client.on('guildCreate', async guild => {
    const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages));
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setColor(0xffb7c5) // Pastel Pink
        .setTitle('🐼 团团入驻成功！主人请多多指教喵！✨')
        .setDescription(`大家好！我是团团，由 **团团熊猫游戏主播 (godking512)** 亲手养大的超级助手喔！\n\n📌 **新手指南:** 主人可以使用 \`/setup-server\` 帮团团布置一个温馨的家喔！\n💎 **至尊特权:** 想要解锁 \`1.5倍经验\` 和 \`尊贵图标\`？快去后台看看升级方案吧！`)
        .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
        .addFields({ name: '🌐 团团的小屋 (后台)', value: '[点击进入 Elite Hub](https://tuantuanbot-28647.web.app)', inline: true })
        .setFooter({ text: 'Kawaii Edition · Designed with Love & Bamboo 🎋' });
    await channel.send({ content: '主人！团团报到喵！🍡🐾', embeds: [embed] });
});


// --- SUPREME+ EXCLUSIVE AUTO-ROLE & WELCOME EVENT ---
client.on('guildMemberAdd', async member => {
    try {
        const config = await getGuildConfig(member.guild.id);
        
        // 1. Supreme+ Auto Role System
        if (config.isPremium) {
            // Tries to find a role called '熊猫之友' or gives the auto role ID if configured
            const autoRole = member.guild.roles.cache.find(r => r.name.includes('熊猫之友')) || member.guild.roles.cache.find(r => r.name.includes('VIP'));
            if (autoRole) await member.roles.add(autoRole).catch(() => {});
        }

        // 2. Global Level DB init
        const userId = member.user.id;
        const guildId = member.guild.id;
        const memberRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
        const doc = await memberRef.get();
        if (!doc.exists) {
            await memberRef.set({ xp: 0, level: 1, bamboo: 10, last_activity: new Date() }); // Newcomers get 10 bamboo
        }
    } catch (e) {
        console.error('Welcome Event Error:', e.message);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'embed_modal') {
            const title = interaction.fields.getTextInputValue('title');
            const description = interaction.fields.getTextInputValue('description');
            let color = interaction.fields.getTextInputValue('color') || '#ff9a9e';
            if (!/^#[0-9A-F]{6}$/i.test(color)) color = '#ff9a9e';
            const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
            await interaction.reply({ content: '✅ 嵌入消息已生成！', embeds: [embed] });
        }
        return;
    }
    // --- MODAL HANDLING (FOR PLAYER EMBEDS) ---
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'embedModal') {
            const title = interaction.fields.getTextInputValue('embedTitle');
            const description = interaction.fields.getTextInputValue('embedDescription');
            let color = interaction.fields.getTextInputValue('embedColor') || '#ff9a9e';
            
            if (!/^#[0-9A-F]{6}$/i.test(color)) color = '#ff9a9e';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp()
                .setFooter({ text: `由 ${interaction.user.username} 精心制作 🐼✨`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ content: '✅ 制作成功！您的作品已发布。', ephemeral: true });
            await interaction.channel.send({ embeds: [embed] });
        }
        return;
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'embedModal') {
            const title = interaction.fields.getTextInputValue('embedTitle');
            const description = interaction.fields.getTextInputValue('embedDescription');
            const color = interaction.fields.getTextInputValue('embedColor') || '#ff85a1';

            try {
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor(color.startsWith('#') ? color : `#${color}`)
                    .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
                    .setFooter({ text: `来自 ${interaction.guild.name} 的团团至尊通知 🐼🎋` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (e) {
                await interaction.reply({ content: '❌ 颜色格式不对哦，请使用 #FFFFFF 这种格式！🐼', ephemeral: true });
            }
        }
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // --- ELITE HUB COMMAND CONTROL & PREMIUM GATING ---
    try {
        const guildConfig = await getGuildConfig(interaction.guild.id);
        const cmdName = interaction.commandName;

        // 1. Module Toggle Checks
        if (['play', 'skip', 'stop', 'queue', 'nowplaying'].includes(cmdName) && guildConfig.musicModule === 'DISABLED') {
            return interaction.reply({ content: '❌ 本服务器已关闭音乐系统模块。管理员可在 Elite Hub 后台重新开启。', ephemeral: true });
        }
        if (['ask', 'chat', 'switch-ai', 'ai-roast', 'ai-story', 'ai-summarize', 'ai-translate'].includes(cmdName)) {
            if (guildConfig.aiModule === 'DISABLED') {
                return interaction.reply({ content: '❌ 本服务器已关闭 AI 对话模块。', ephemeral: true });
            }
            if (guildConfig.aiChannelId && interaction.channel.id !== guildConfig.aiChannelId) {
                return interaction.reply({ content: `❌ 呜呜，请前往专属的 <#${guildConfig.aiChannelId}> 频道使用 AI 功能喔！`, ephemeral: true });
            }
        }

        // 2. Premium Check for Specific Restricted Commands
        if (command.premiumOnly && !guildConfig.isPremium) {
            const embed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle('💎 需要 TuanTuan Supreme+ 授权')
                .setThumbnail('https://cdn-icons-png.flaticon.com/512/5903/5903511.png')
                .setDescription(`抱歉，该指令为 **Supreme+** 专享特权。基础版服务器暂时无法调用。\n\n**如何解锁？**\n可在官方后台获取激活码，使用 \`/redeem\` 将您的服务器升级为全速版！`)
                .setFooter({ text: 'Supreme Elite Hub 3.0' });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await command.execute(interaction); 
    } 
    catch (error) {
        console.error('❌ Interaction Error:', error.message);
        const errorMsg = '哎呀，团团撞到竹子了！😵 抱歉老板 (godking512)，刚才核心引擎有点小感冒，请稍后再试一下哦！🐼🎋';
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: errorMsg, ephemeral: true });
        } else {
            await interaction.followUp({ content: errorMsg, ephemeral: true });
        }
    }
});

const { generateRankCard, generateLevelUpCard } = require('./utils/rank-card');

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    const levelUp = await giveXpAndRewards(message.guild.id, message.author.id);
    if (levelUp) {
        try {
            const buffer = await generateLevelUpCard(message.author, levelUp);
            const attachment = new AttachmentBuilder(buffer, { name: 'level-up.png' });
            
            const embed = new EmbedBuilder()
                .setColor(0xffb7c5) // Pastel Pink
                .setTitle('🎊 哇！主人升级啦！✨')
                .setDescription(`恭喜 **${message.author.username}** 成功晋升至 **第 ${levelUp} 级**！团团超级崇拜主人的说！🍡🐼🎋`)
                .setImage('attachment://level-up.png')
                .setFooter({ text: '团团今天也要陪主人一起变强哒！🐾' })
                .setTimestamp();
                
            await message.reply({ content: `恭喜主人升级成功！团团已经帮主人存进荣誉室啦！🍢`, files: [attachment], embeds: [embed] });
        } catch (error) {
            console.error('Level Up Card Error:', error);
            // Fallback to text message if image fails
            await message.reply(`🎊 恭喜 **${message.author.username}** 成功晋升至 **Level ${levelUp}**！团团超级开心哒！🐾✨`);
        }
    }


    let config = await getGuildConfig(message.guild.id);
    if (config.aiChannelId === message.channel.id || message.mentions.has(client.user)) {
        message.channel.sendTyping();
        try {
            const prompt = `你是一只叫“团团”的超可爱熊猫机器人。用户说：${message.cleanContent}`;
            const response = await getAIResponse(prompt, message.guild.id);
            await message.reply(response);
        } catch (e) {
             console.error('❌ AI Reply Interaction Error:', e.message);
        }
    }

    // --- PER-SERVER OR GLOBAL PREFIX ---
    let prefix = '!';
    try {
        const globalConfig = await db.collection('config').doc('global').get();
        if (globalConfig.exists) prefix = globalConfig.data().prefix || '!';

        const guildDoc = await db.collection('guilds').doc(message.guild.id).get();
        if (guildDoc.exists && guildDoc.data().prefix) prefix = guildDoc.data().prefix;
    } catch (e) {}

    if (message.content.startsWith(prefix)) {
        const action = message.content.slice(prefix.length).trim();
        if (!action) return;
        try {
            const response = await getAIResponse(`扮演可爱的熊猫机器人团团。用户指令：${action}。请用一句超萌的第三人称反应。`, message.guild.id);
            await message.reply(response);
        } catch (e) {}
    }
});

// --- GLOBAL SUPREME HEARTBEAT ---
const syncStats = async () => {
    try {
        const guildCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
        
        await db.collection('global_stats').doc('aggregate').set({
            guilds: guildCount,
            users: userCount,
            last_heartbeat: new Date(),
            version: 'Supreme 8.0',
            status: 'online'
        }, { merge: true });
        
        console.log(`📊 [Sync] Supreme Core Online | Active Guilds: ${guildCount}`);
    } catch (e) {
        console.error('❌ Stats Sync Error:', e.message);
    }
};

// --- SUPREME CLOUD HEALING (24/7 SUPPORT) ---
async function startSupremeCore() {
    try {
        console.log('◇ TuanTuan Cloud Engine: Priming for 24/7 operations...');
        // Force bind port for cloud platforms (Render, Railway, etc.)
        const fastExpress = require('express')();
        fastExpress.get('/', (req, res) => res.status(200).send('<h1>Panda Cloud is ONLINE 🐼💎</h1>'));
        fastExpress.listen(process.env.PORT || 8080, '0.0.0.0', () => {
            console.log(`🚀 Heartbeat active on port ${process.env.PORT || 8080}`);
        });

        // Initialize Stats Sync
        setInterval(syncStats, 900000); // 15 mins
        syncStats();
    } catch (e) {
        console.error('❌ Cloud Launch Error:', e);
    }
}

startSupremeCore();


// Command counter and XP reward middleware
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    // Command-based rewards
    try {
        const levelUp = await giveXpAndRewards(interaction.guildId, interaction.user.id, 5, 2);
        if (levelUp) {
            const buffer = await generateLevelUpCard(interaction.user, levelUp);
            const attachment = new AttachmentBuilder(buffer, { name: 'level-up.png' });
            const embed = new EmbedBuilder()
                .setColor(0xffb7c5)
                .setTitle('🎊 哇！主人升级啦！✨')
                .setDescription(`在主人的带领下，团团又变强了喵！\n**${interaction.user.username}** 成功晋升至 **${levelUp} 级**！`)
                .setImage('attachment://level-up.png')
                .setFooter({ text: 'Designed by godking512 · 团团会一直守护主人喵 🐾' });
            
            await interaction.followUp({ content: '报告主人！捕捉到一个高光时刻：🍢', files: [attachment], embeds: [embed], ephemeral: true }).catch(() => {});
        }
    } catch (e) {
        console.error('❌ Interaction XP Error:', e.message);
    }
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught exception:', error);
});

client.login(process.env.DISCORD_TOKEN);
