const express = require('express');
const bot = express.Router();
const client = require('../../src/bot');

bot.post('/:id', async (req, res) => {
    try {
        const guild = client.guilds.cache.get(req.params.id);
        const name = req.body.nickname;
        const member = guild.members.cache.get(client.user.id);
        member.setNickname(name)
            .then(() => {
                // console.log('Nickname changed successfully!');
                res.json({ success: true });
            })
            .catch(error => {
                console.error('Error occurred while changing nickname:', error);
                res.status(500).json({ success: false, error: 'Failed to change nickname' });
            });
        // console.log(member)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

bot.get('/guilds', async (req, res) => {
    // const guilds = await client.guilds.fetch();
    // const guildsArray = Array.from(guilds.values());
    // const serializedGuilds = guildsArray.map(guild => ({
    //     ...guild,
    //     permissions: guild.permissions.bitfield.toString()
    // }));
    const userData = req.session.data.user;
    // console.log(userData)
    const userGuilds = client.guilds.cache.filter(guild => guild.members.cache.has(userData.id));
    // console.log(userGuilds)
    res.json({
        user: userData,
        userGuilds: userGuilds
    });
})

module.exports = bot;
