const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('💖 向主人们发送充满粉色泡泡的互动喵！✨')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('主人想做哪个可爱的动作呀？')
                .setRequired(true)
                .addChoices(
                    { name: '🫂 抱抱 (Hug)', value: 'hug' },
                    { name: '💋 亲亲 (Kiss)', value: 'kiss' },
                    { name: '🧸 摸摸头 (Pat)', value: 'pat' },
                    { name: '👋 挥挥手 (Wave)', value: 'wave' },
                    { name: '😳 害羞羞 (Blush)', value: 'blush' },
                    { name: '😢 呜呜哭 (Cry)', value: 'cry' },
                    { name: '💃 摇摆舞 (Dance)', value: 'dance' },
                    { name: '😆 挠痒痒 (Tickle)', value: 'tickle' },
                    { name: '😠 鼓脸颊 (Pout)', value: 'pout' },
                    { name: '💖 发比心 (Love)', value: 'love' },
                    { name: '🐾 蹭蹭脸 (Nuzzle)', value: 'nuzzle' },
                    { name: '💤 睡午觉 (Sleep)', value: 'sleep' },
                    { name: '😵 转圈圈 (Spin)', value: 'spin' },
                    { name: '🐼 熊猫抱 (Pandahug)', value: 'pandahug' },
                    { name: '🍴 喂竹子 (Eat)', value: 'eat' },
                    { name: '👏 拍拍手 (Clap)', value: 'clap' }
                ))
        .addUserOption(option => 
            option.setName('target')
                .setDescription('要把这份爱意传达给谁呢？(默认大家)')
                .setRequired(false)),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const target = interaction.options.getUser('target');
        const user = `**${interaction.user.username}**`;
        const targetName = target ? `**${target.username}**` : '大家';

        const gifs = {
            hug: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGlkNzl4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4Z3B4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/PHZ7v9tfQu0o0/giphy.gif',
            kiss: 'https://media.tenor.com/F02Upn-Eos0AAAAi/panda-love.gif',
            pat: 'https://media.tenor.com/65x1NnBPn6AAAAAi/panda-pat.gif',
            blush: 'https://media.tenor.com/r_z71h8mDBkAAAAi/panda-blush.gif',
            cry: 'https://media.tenor.com/pZqN-QkLq1AAAAAi/crying-panda.gif',
            dance: 'https://media.tenor.com/FwK2qB_mSBEAAAAi/panda-dance.gif',
            tickle: 'https://media.tenor.com/I2vXDEjY8e8AAAAi/poke-panda.gif',
            love: 'https://media.tenor.com/hHntN0D7XzYAAAAi/panda-heart.gif',
            nuzzle: 'https://media.tenor.com/nJgFYyP5Fh4AAAAi/cute-panda.gif',
            sleep: 'https://media.tenor.com/zUBHj4GzX-UAAAAi/panda-sleep.gif'
        };

        let response = '';
        switch(type) {
            case 'wave': response = `👋 ${user} 伸出圆滚滚的小爪子，向 ${targetName} 挥了挥！欢迎光临喵~`; break;
            case 'pat': response = `🧸 ${user} 温柔地摸了摸 ${targetName} 的小脑袋，还要不要再摸一下呀？`; break;
            case 'kiss': response = `💋 ${user} 悄悄踮起脚尖，给了 ${targetName} 一个甜甜的糯米糍亲亲！`; break;
            case 'nuzzle': response = `💕 ${user} 亲昵地用脸颊蹭了蹭 ${targetName}，这也太粘人了吧喵~`; break;
            case 'dance': response = `💃 ${user} 和 ${targetName} 一起跳起了欢快的摇摆舞，地板都要塌了喵！`; break;
            case 'hug': response = `🫂 ${user} 像个超大号棉花糖一样，紧紧地抱住了 ${targetName}！`; break;
            case 'eat': response = `🍽️ ${user} 找来了最新鲜的竹子，邀请 ${targetName} 一起大快朵颐喵！`; break;
            case 'sleep': response = `💤 ${user} 在 ${targetName} 身边打起了欢快的小呼噜，睡得真香喵~`; break;
            case 'pout': response = `😠 ${user} 对着 ${targetName} 委屈巴巴地鼓起了脸颊，快来哄哄它呀！`; break;
            case 'blush': response = `😳 ${user} 看到 ${targetName} 的瞬间，脸蛋儿红得像个熟透的小苹果！`; break;
            case 'tickle': response = `😆 ${user} 正在疯狂挠 ${targetName} 的小肚子，看你还敢不敢调皮！`; break;
            case 'love': response = `💖 ${user} 对 ${targetName} 发射了一枚超大号的比心，砰砰！`; break;
            case 'spin': response = `😵 ${user} 拉着 ${targetName} 转起了圈圈，最后双双跌进草丛里了喵！`; break;
            case 'pandahug': response = `🐼 ${user} 给了 ${targetName} 一个超有分量的熊猫大抱抱，好暖和喔！`; break;
            case 'clap': response = `👏 ${user} 双手都拍红了，疯狂为 ${targetName} 打Call！真棒喵！`; break;
            case 'cry': response = `😢 ${user} 哭得像个小花猫，正靠在 ${targetName} 肩膀上抹眼泪呢...`; break;
            default: response = `✨ ${user} 和 ${targetName} 进行了超甜的神秘互动！`;
        }

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setDescription(`🌸 **团团快报！**\n\n${response}`)
            .setFooter({ text: '与主人的每一次互动，团团都记在心里喔 🐾🍡' });

        if (gifs[type]) {
            embed.setImage(gifs[type]);
        }

        await interaction.reply({ content: '报告主人！捕捉到一个超级甜的瞬间喵：🍢', embeds: [embed] });
    },
};

