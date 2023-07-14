const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logs } = require('../../db')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Select a member to warn.')
        .addUserOption(option => option.setName('target').setDescription('whose turn today').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('and reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') ?? "no reason provided"
        // const { user } = interaction;
        // console.log(user)

        // .setAuthor(user, user.avatar)
        const success = new EmbedBuilder()
            .setColor(0x9cff63)
            .setTitle('warning')
            .addFields(
                { name: "user", value: `<@${member.id}>`, inline: false },
                { name: "reason", value: reason, inline: false }
            )
            .setTimestamp()

        try {
            const log = await logs.create({
                type: 'warn',
                userId: member.id,
                moderatorId: interaction.user.id,
                reason: reason
            });
            await log.save();
            await interaction.reply({ embeds: [success] });
            await member.send({ embeds: [success] })

        } catch (error) {
            console.log(error)
            await interaction.reply('sorry, ;( i guess some error appeared')
        }

    },
};