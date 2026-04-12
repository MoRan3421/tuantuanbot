const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp-admin')
        .setDescription('🔱 管理员专属：掌控全服熊猫经验值！(加/减经验)')
        .addUserOption(option => option.setName('target').setDescription('目标成员').setRequired(true))
        .addStringOption(option => 
            option.setName('action')
                .setDescription('你要做什么？')
                .setRequired(true)
                .addChoices(
                    { name: '➕ 增加经验 (Add)', value: 'add' },
                    { name: '➖ 扣除经验 (Remove)', value: 'remove' },
                    { name: '🧹 重置为零 (Reset)', value: 'reset' }
                ))
        .addIntegerOption(option => option.setName('amount').setDescription('经验值数量').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ 您还没有掌握这种“神之力”哦！(仅限管理)', ephemeral: true });
        }

        const user = interaction.options.getUser('target');
        const action = interaction.options.getString('action');
        const amount = interaction.options.getInteger('amount') || 0;
        const db = admin.firestore();

        const memberRef = db.collection('guilds').doc(interaction.guild.id).collection('members').doc(user.id);

        if (action === 'reset') {
            await memberRef.set({ xp: 0, level: 1 }, { merge: true });
        } else {
            const increment = action === 'add' ? amount : -amount;
            await memberRef.set({
                xp: admin.firestore.FieldValue.increment(increment)
            }, { merge: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🔱 经验值神谕已下达')
            .setDescription(`**${user.username}** 的经验值已更新！\n**操作:** \`${action.toUpperCase()}\` | **数值:** \`${amount}\``)
            .setFooter({ text: 'TuanTuan Supreme Admin Tool 🐼' });

        await interaction.reply({ embeds: [embed] });
    },
};
