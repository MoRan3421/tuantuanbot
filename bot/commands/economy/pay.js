const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('💸 慷慨的主人，快把好吃的竹子送给小伙伴吧！✨')
        .addUserOption(option => option.setName('target').setDescription('谁是那个幸运的小伙伴呀？').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('想送多少根竹子呢？').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const db = admin.firestore();
        const guildId = interaction.guild.id;

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: '❌ 呜呜，主人不能把竹子从左手倒进右手喔！', ephemeral: true });
        }
        if (target.bot) {
            return interaction.reply({ content: '❌ 机器人小伙伴不需要竹子，它们只吃电磁波喵！', ephemeral: true });
        }

        const senderRef = db.collection('guilds').doc(guildId).collection('members').doc(interaction.user.id);
        const receiverRef = db.collection('guilds').doc(guildId).collection('members').doc(target.id);

        const senderDoc = await senderRef.get();
        const senderData = senderDoc.exists ? senderDoc.data() : { bamboo: 0 };

        if ((senderData.bamboo || 0) < amount) {
            return interaction.reply({ content: `❌ 余额不足喵！主人只有 \`${senderData.bamboo || 0}\` 根竹子，给不了那么多喔。`, ephemeral: true });
        }

        // Execute transfer
        await senderRef.set({ bamboo: admin.firestore.FieldValue.increment(-amount) }, { merge: true });
        await receiverRef.set({ bamboo: admin.firestore.FieldValue.increment(amount) }, { merge: true });

        const embed = new EmbedBuilder()
            .setColor(0xffb7c5) // Pastel Pink
            .setTitle('💸 团团的礼物快递 · 送达！')
            .setThumbnail('https://i.ibb.co/Lzdg1K6L/panda-logo.png')
            .setDescription(`哇！**${interaction.user.username}** 主人大发慈悲，送给 **${target.username}** 一份超级大礼！`)
            .addFields(
                { name: '🎋 小礼物数量', value: `\`${amount}\` 根竹子`, inline: true },
                { name: '💰 主人剩余小金库', value: `\`${(senderData.bamboo || 0) - amount}\` 根`, inline: true }
            )
            .setFooter({ text: '慷慨的主人最迷人啦 🐾🍡 | Designed by godking512' })
            .setTimestamp();

        await interaction.reply({ content: '嘿咻！团团已经飞快地把竹子搬过去啦：🍢', embeds: [embed] });
    },
};

