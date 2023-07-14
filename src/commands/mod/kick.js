const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logs } = require('../../db')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member to kick.')
		.addUserOption(option => option.setName('target').setDescription('who is being annoying?').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('and reason').setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),
	category: 'mod',
	async execute(interaction) {
		const member = interaction.options.getMember('target');
		const reason = interaction.options.getString('reason') ?? "no reason provided"
		if (member.id === interaction.user.id) return interaction.reply(';-; you cant do that dude');
		const success = new EmbedBuilder()
			.setColor(0x9cff63)
			.setTitle('successfully kicked')
			.addFields(
				{ name: "user", value: `<@${member.id}>`, inline: false },
				{ name: "reason", value: reason, inline: false }
			)
			.setTimestamp()


		try {
			const log = await logs.create({
				type: 'kick',
				userId: member.id,
				moderatorId: interaction.user.id,
				reason: reason
			});
			await log.save();
			await interaction.reply({ embeds: [success] });
			await interaction.guild.members.kick(member);
			await member.send({ embeds: [success] });
		} catch (error) {
			console.log(error)
			await interaction.reply('sorry, ;( i guess some error appeared')
		}

	},
};