//importing stuffs
const { Events, codeBlock, EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const client = require('../bot');
const { Tags, logs, User } = require('../db');


module.exports = {
  name: Events.MessageCreate,
  on: true,
  async execute(message) {
    if (message.author.bot) return;
    //receiving tag data from database
    const data = await Tags.findAll({ order: [['name', 'ASC']] });
    const tag = data.find(elem => message.content.startsWith(elem.name));//finding tag
    //checking and sending tag message
    if (tag) {
      const uTag = await tag.toJSON();
      await tag.increment('usage_count', {}).then(() => {
      }).catch((error) => {
        console.error('Error incrementing column:', error);
      });
      return message.channel.send(uTag.description);
    };
    //maki's commands
    if (message.content === 'maki') {
      message.reply('yes?');
      const c_filter = (msg) => msg.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({ filter: c_filter, max: 1 });
      collector.on('collect', (nextMessage) => {
        if (nextMessage.content.toLowerCase() === 'love ya') {
          message.reply('awww love you too <3 ');
        }
      });
    }
    //aki baki rumba command
    else if (message.content.startsWith('baki')) {
      const msg = message.content.slice(5);
      if (!msg) return;
      message.delete().catch(err => console.log(err));
      message.channel.send(msg).catch(err => console.log(err));

    }
  }
}