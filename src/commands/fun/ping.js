const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('member count'),
  category: 'fun',
  execute: async (interaction) => {
    interaction.reply('ping in ur ass')
  },
}