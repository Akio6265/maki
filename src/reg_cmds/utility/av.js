const { EmbedBuilder } = require("discord.js");



module.exports = {
    name: 'av',
    description: 'See your beautiful pfp',
    execute: async (message, arg) => {
        try {
            let member;
            const mention = message.mentions.members.first();
            const userID = arg[0];
            const bool = arg[1];
            if (mention) {
                member = mention;
            } else if (userID) {
                member = message.guild.members.cache.get(userID);
            } else {
                member = message.member;
            }
            if (!member) {
                return message.reply('Invalid user.');
            };
            let av = member.user.displayAvatarURL({ size: 4096, format: 'png', dynamic: true });
            if (bool) {
                av = member.displayAvatarURL({ size: 4096, format: 'png', dynamic: true });
            }
            const avatar = new EmbedBuilder().setColor(0xffe83d).setImage(av);
            await message.channel.send({ embeds: [avatar] });
        } catch (err) {
            console.log(err)
            return message.reply('some error appeared, call aki')
        }
    }
}