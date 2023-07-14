const { EmbedBuilder } = require("discord.js");
const { User, logs } = require("../../db");
const { fn, col } = require('sequelize');


module.exports = {
    name: 'userinfo',
    description: 'info of user',
    execute: async (message, arg) => {
        try {
            let member;
            const mention = message.mentions.members.first();
            const userID = arg[0];
            if (mention) {
                member = mention;
            } else if (userID) {
                member = message.guild.members.cache.get(userID);
            } else {
                member = message.member;
            }
            if (!member) {
                return message.reply('Invalid user.');
            }
            const user = await User.findOne({ where: { userID: member.id } });
            if (!user) return message.reply('Dead user, never texted not even once')
            let mod = await logs.findAll({
                attributes: ['type', [fn('COUNT', col('type')), 'count']],
                where: { userId: member.id },
                group: ['type'],
                raw: true
            });
            var logMsg;
            if (mod.length === 0) {
                logMsg = 'No log records';
            }
            else {
                logMsg = mod.map((entry) => (`Type: ${entry.type} [${entry.count}]`)).join(', ');
            }
            const requireExp = Math.pow(user.level, 2) * 200;
            const percentage = String((user.xp / requireExp * 100).toFixed(2));
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setAuthor({ name: member.user.tag })
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: "Username", value: member.user.tag, inline: false },
                    { name: 'Joined Server', value: member.joinedAt.toDateString() },
                    { name: 'Level', value: String(user.level), inline: true },
                    { name: 'Exp', value: `${String(user.xp)}, progress: ${percentage}%`, inline: true },
                    { name: 'Roles', value: member.roles.cache.map((role) => `<@&${role.id}>`).join('   ') },
                    { name: 'logs', value: logMsg }
                )
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err)
            return message.reply('some error appeared, call aki')
        }
    }
}