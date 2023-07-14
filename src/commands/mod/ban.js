const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Looks like serious matter')
        .addUserOption(option => option.setName('target').setDescription('whose turn').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        if (member.id === interaction.user.id) return interaction.reply(';-; you cant do that dude');

        try {
            await member.send('bye bye, you got banned');
            await interaction.reply({ content: `gg, ${member.user.username} has been Banned` });
            await member.ban();

        } catch (error) {
            console.log(error)
            await interaction.reply('sorry, ;( i guess some error appeared')
        }

    },
};