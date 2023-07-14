module.exports = {
    name: 'dm',
    description: 'dm a user',
    execute: async (message, args) => {
        let member;
        try {

            const mention = message.mentions.members.first();
            const userID = args[0];
            if (mention) {
                member = mention;
            } else if (userID) {
                member = message.guild.members.cache.get(userID)
            };
            // console.log(member);
            const msg = message.content.trim().split(/ +/);
            const txt = msg.slice(2).join(' ');
            if (!txt) return message.reply('say something dumbass');
            await member.send(txt);
            await message.channel.send(`"${txt}" send to: ${member.user.username}`)
        } catch (err) {
            await message.channel.send('error sending message')
            console.log(err)
        }
    }
}