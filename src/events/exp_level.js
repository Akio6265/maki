const { Events } = require("discord.js");
const { User } = require('../db')
const prefix = "?";

const level = async function (user, requireExp, message) {
    if (user.xp < requireExp) return;
    const loop = async () => {
        while (user.xp >= requireExp) {
            user.level += 1;
            user.xp -= requireExp;
            requireExp = Math.pow(user.level, 2) * 200;
            await user.save();
        }
    }
    await loop();
    await message.channel.send(`Congratulations! ${user.name}, You reached level ${user.level}`);
}
const cooldowns = {};

module.exports = {
    name: Events.MessageCreate,
    on: true,
    async execute(message) {
        if (message.author.bot) return;

        const lastXPTime = cooldowns[message.author.id];
        if (lastXPTime && (Date.now() - lastXPTime) < 3000) {
            return; // User is still on cooldown, exit the function
        }
        cooldowns[message.author.id] = Date.now(); // Update the cooldown timestamp for the user

        try {
            const [user, created] = await User.findOrCreate({
                where: { userId: message.author.id },
                defaults: {
                    name: message.author.username,
                    messageCount: 0,
                    xp: 0,
                    level: 1
                }
            });
            const randomExp = Math.floor(Math.random() * 4) + 7;
            const requireExp = Math.pow(user.level, 2) * 200;

            if (created) {
                user.messageCount += 1;
                return await message.reply(`Your journey has begun, young warrior ${message.author.username}!`);
            }
            else if (user) {
                user.messageCount += 1;
                user.xp += randomExp;
                await user.save();
                level(user, requireExp, message);
            };

        } catch (err) {
            console.log(err);
            message.channel.send('An error occurred. Please contact the bot owner for assistance.');
        }
        if (!message.content.startsWith(prefix)) return;
        const arg = message.content.slice(prefix.length).trim().split(/ +/);//command args args args
        const command = arg.shift().toLowerCase();
        if (command === 'give') {
            const key = arg.shift();
            let mentionedUser;
            mentionedUser = message.mentions.members.first();
            const userID = arg[0];
            if (!mentionedUser) {
                mentionedUser = message.guild.members.cache.get(userID);
            }
            let amount = parseInt(arg[1]);
            if (!amount) amount = 1;
            if (!mentionedUser) return message.reply('mention someone');
            const mentionedU = await User.findOne({ where: { userId: mentionedUser.id } }).catch(err => { message.reply("failed to add exp"); console.log(err) })
            const requireExp = Math.pow(mentionedU.level, 2) * 200;
            switch (key) {
                case 'exp':
                    mentionedU.xp += amount;
                    await mentionedU.save();
                    await message.channel.send(`${amount} exp given to ${mentionedU.name} `);
                    await level(mentionedU, requireExp, message);
                    break;
                case 'level':
                    mentionedU.level += amount;
                    await mentionedU.save();
                    await message.channel.send(`promoted ${mentionedU.name} to level ${mentionedU.level}`);
                    break
                default:
                    message.reply('``!give exp <user> <amount> \n !give level <user> <amount>``')
                    break;
            };
        }
        else if (command === 'take') {
            const key = arg.shift();
            let mentionedUser;
            mentionedUser = message.mentions.members.first();
            const userID = arg[0];
            if (!mentionedUser) {
                mentionedUser = message.guild.members.cache.get(userID);
            }
            let amount = parseInt(arg[1]);
            if (!amount) amount = 1;
            if (!mentionedUser) return message.reply('mention someone');
            const mentionedU = await User.findOne({ where: { userId: mentionedUser.id } }).catch(err => { message.reply("failed to take exp"); console.log(err) });
            switch (key) {
                case 'exp':
                    let bool = true;
                    const loop = async function () {
                        while (mentionedU.xp < 0 && mentionedU.level >= 0) {
                            const convertedExp = Math.pow(mentionedU.level - 1, 2) * 200;
                            mentionedU.level -= 1;
                            mentionedU.xp += convertedExp;
                            mentionedU.save();
                            bool = false;
                        }
                        await message.channel.send(`Taken away ${amount} exp from ${mentionedU.name} `);
                    };
                    mentionedU.xp -= amount;
                    await mentionedU.save();
                    await loop();
                    if (bool) return;
                    await message.channel.send(`lol ${mentionedU.name}, You are demoted to level ${mentionedU.level}`);
                    break;
                case 'level':
                    mentionedU.level -= amount;
                    mentionedU.save();
                    await message.channel.send(`Demoted ${mentionedU.name} to level ${mentionedU.level}`)
                    break;
                default:
                    message.reply('``!take exp <user> <amount> \n !take level <user> <amount>``');
                    break;
            };
        }
    }
}