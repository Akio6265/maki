const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms')
const { logs } = require('../../db')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Select a member to mute.')
        .addUserOption(option => option.setName('target').setDescription('who is getting on your nerves').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('duration').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('and reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        const time = interaction.options.getString('time')
        const reason = interaction.options.getString('reason') ?? "no reason provided"
        const cTime = ms(time) ?? 3600;
        // const { user } = interaction;
        // console.log(user)

        // .setAuthor(user, user.avatar)
        const success = new EmbedBuilder()
            .setColor(0x9cff63)
            .setTitle('successfully muted')
            .addFields(
                { name: "user", value: `<@${member.id}>`, inline: false },
                { name: "time", value: time, inline: false },
                { name: "reason", value: reason, inline: false }
            )
            .setTimestamp()

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            console.log('oh no');
            return await interaction.reply('lol you cant do that');
        }
        else if (!cTime) console.log('no gg')
        try {
            const log = await logs.create({
                type: 'mute',
                userId: member.id,
                moderatorId: interaction.user.id,
                reason: reason
            });
            await log.save();
            await interaction.reply({ embeds: [success] });
            await member.timeout(cTime, reason);
            await member.send({ embeds: [success] })

        } catch (error) {
            console.log(error)
            await interaction.reply('sorry, ;( i guess some error appeared')
        }

    },
};