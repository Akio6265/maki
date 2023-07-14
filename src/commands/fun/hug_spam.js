const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { key } = require('../../../config.json');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hug_spam')
    .setDescription('spam hugs xD')
    .addUserOption(option => option.setName('target').setDescription('*evil laugh*').setRequired(true))
    .addIntegerOption(option => option.setName('count').setDescription('how many pings? 1-50, by default it is 5').setMinValue(1).setMaxValue(50)),
  category: 'fun',
  async execute(interaction) {
    if (interaction.user.id !== '952975852801523762') {
      return interaction.reply("Only Aki can use this command :3")
    }
    const member = interaction.options.getMember('target');
    const a = interaction.options.getInteger('count') ?? 5;


    //gif
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm spam')
      .setStyle(ButtonStyle.Primary);
    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(confirm, cancel);
    const response = await interaction.reply({
      content: `Are you sure you want to spam hug ${member}?`,
      components: [row],
    });

    const collectorFilter = i => i.user.id === interaction.user.id;
    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
    const myEmbed = new EmbedBuilder();

    const message = `*hugs for ${member}*`;

    try {
      const result = await fetch(`https://tenor.googleapis.com/v2/search?q=anime+cuddle&key=${key}&client_key=maki's+project&limit=15&contentfilter=medium&media_filter=minimal`).catch(er => console.log('er'));
      const data = await result.json();
      const gifs = data.results;
      if (confirmation.customId === 'confirm') {
        await confirmation.update({ content: 'Spam is about to start', components: [] });
        await wait(500);
        await confirmation.editReply({ content: '3', components: [] });
        await wait(500);
        await confirmation.editReply({ content: '2', components: [] });
        await wait(500);
        await confirmation.editReply({ content: '1', components: [] });
        await wait(500);
        await confirmation.editReply({ content: 'Starting', components: [] });
        await wait(250);
        await confirmation.channel.send('Here we go <a:ramtwirl:1114565845218230275>', a, "hugs").then(sentMessage => {
          sentMessage.react('<a:kokomiclap:1111172723541024818>');
          for (let i = 1; i < a + 1; i++) {


            myEmbed.setColor(0xf5f542)
              .setImage(gifs[Math.floor(Math.random() * gifs.length)].media_formats.gif.url)
              .setTimestamp();
            confirmation.channel.send({ content: `${i}. ${message}`, embeds: [myEmbed] }).then(sentMessage => {
              sentMessage.react('<:YaeMikoWatching:1113478319535554610>');
            });
          }
        });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({ content: 'Action cancelled', components: [] });
      } else {
        confirmation.update({ content: 'Some error occurred', components: [] });
      }
    } catch (e) {
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    }
  }
}
