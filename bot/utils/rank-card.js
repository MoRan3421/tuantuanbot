const Jimp = require('jimp');
const path = require('path');

/**
 * Generates a cute rank card for TuanTuan bot.
 * @param {Object} user - Discord User object
 * @param {Object} data - User economy/xp data ({ level, xp, bamboo, isPremium })
 */
async function generateRankCard(user, data) {
    const { level = 1, xp = 0, isPremium = false } = data;
    const nextLevelXp = level * 250;
    const percent = Math.min(100, Math.floor((xp / nextLevelXp) * 100));

    // Choose background based on level/premium
    let bgPath = path.join(__dirname, '../assets/rank/rank-template.png');
    if (level >= 10 || isPremium) {
        bgPath = path.join(__dirname, '../assets/rank/high-rank.png');
    }
    
    const image = await Jimp.read(bgPath);
    const avatarImg = await Jimp.read(user.displayAvatarURL({ extension: 'png', size: 128 }));

    // Resize and make avatar round
    avatarImg.resize(110, 110);
    avatarImg.circle();
    image.composite(avatarImg, 45, 45);

    // Load fonts
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const fontSub = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    // Draw Name
    image.print(fontTitle, 180, 50, user.username);

    // Draw Level and XP
    image.print(fontSub, 180, 95, `Level ${level}`);
    image.print(fontSub, 600, 95, `XP: ${xp} / ${nextLevelXp}`);

    // Draw Progress Bar
    const barX = 180;
    const barY = 130;
    const barW = 550;
    const barH = 20;

    // Background of bar
    const barBg = new Jimp(barW, barH, '#FFFFFF55');
    image.composite(barBg, barX, barY);

    // Progress of bar (Pink/Gold)
    const barColor = isPremium ? '#FFD700' : '#FF85A1';
    if (percent > 0) {
        const barFg = new Jimp(Math.floor((barW * percent) / 100), barH, barColor);
        image.composite(barFg, barX, barY);
    }

    // Add Premium Badge if applicable
    if (isPremium) {
        const fontPremium = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
        image.print(fontPremium, 600, 50, "💎 SUPREME PLAYER");
    }

    return await image.getBufferAsync(Jimp.MIME_PNG);
}

/**
 * Generates a level-up celebration card.
 */
async function generateLevelUpCard(user, level) {
    const bgPath = path.join(__dirname, '../assets/rank/level-up.png');
    const image = await Jimp.read(bgPath);
    const avatarImg = await Jimp.read(user.displayAvatarURL({ extension: 'png', size: 128 }));

    avatarImg.resize(100, 100);
    avatarImg.circle();
    image.composite(avatarImg, 60, 140);

    const fontLevel = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const fontName = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    image.print(fontName, 180, 160, user.username);
    image.print(fontLevel, 600, 140, `LV ${level}`);

    return await image.getBufferAsync(Jimp.MIME_PNG);
}

/**
 * Generates a profile card.
 */
async function generateProfileCard(user, data) {
    const { level = 1, bamboo = 0, hugs = 0, kisses = 0, isPremium = false } = data;
    const bgPath = path.join(__dirname, '../assets/rank/profile-bg.png');
    
    const image = await Jimp.read(bgPath);
    const avatarImg = await Jimp.read(user.displayAvatarURL({ extension: 'png', size: 128 }));

    avatarImg.resize(120, 120);
    avatarImg.circle();
    image.composite(avatarImg, 50, 80);

    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontSub = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    image.print(fontTitle, 200, 90, user.username);
    image.print(fontSub, 200, 140, `Level: ${level}`);
    image.print(fontSub, 200, 170, `Bamboo: ${bamboo} 🎋`);
    
    image.print(fontSub, 50, 260, `🫂 Hugs: ${hugs}`);
    image.print(fontSub, 50, 290, `💋 Kisses: ${kisses}`);

    if (isPremium) {
        image.print(fontSub, 600, 90, "💎 SUPREME VIP");
    }

    image.print(fontSub, 600, 350, "By godking512 @ 团团");

    return await image.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = { generateRankCard, generateLevelUpCard, generateProfileCard };
