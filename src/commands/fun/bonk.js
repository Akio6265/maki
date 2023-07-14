const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { key } = require('../../../config.json');
module.exports = {
  data: new SlashCommandBuilder().setName('bonk').setDescription('bonk someone')
    .addUserOption(op => op.setName('who').setDescription('who is being annoying?').setRequired(true)),
  category: 'fun',
  async execute(interaction) {

    //gif
    try {

      const result = await fetch(`https://tenor.googleapis.com/v2/search?q=anime+bonk&key=${key}&client_key=maki's+project&limit=15&contentfilter=medium&media_filter=minimal`).catch(er => console.log('er'));
      const data = await result.json();
      const gifs = data.results;
      const index = Math.floor(Math.random() * gifs.length)
      const gif = gifs[index].media_formats.gif.url;
      const member = interaction.options.getMember('who');
      const message = `${interaction.user} bonks ${member}`;

      const myEmbed = new EmbedBuilder()
        .setColor(0xf5f542)
        .setImage(gif)
        .setTimestamp()
      await interaction.reply({ content: message, embeds: [myEmbed] })
    } catch (error) {
      console.log(error)
      await interaction.reply('sorry, ;( i guess some error appeared')
    }
  }
}