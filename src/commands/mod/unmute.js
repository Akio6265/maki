const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Select a member to unmute.')
        .addUserOption(option => option.setName('target').setDescription('who is getting on your nerves').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        // const { user } = interaction;
        console.log(member.user.username)
        // .setAuthor(user, user.avatar)
        const success = new EmbedBuilder()
            .setColor(0x9cff63)
            .setTitle('successfully unmuted ' + member.user.username)
            .setTimestamp()

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            console.log('oh no');
            return await interaction.reply('lol you cant do that');
        }
        try {
            await interaction.reply({ embeds: [success] });
            await member.timeout(null);

        } catch (error) {
            console.log(error)
            await interaction.reply('sorry, ;( i guess some error appeared')
        }
    },
};