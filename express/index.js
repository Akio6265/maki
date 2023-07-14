const express = require('express');
const app = express();
const { port, clientId, clientSecret } = require('../config.json');
const path = require('path');
const bot = require('./router/bot');
const client = require('../src/bot');
app.use(express.urlencoded({ extended: true }))
const { request } = require('undici');
const session = require('express-session');
const { PermissionsBitField } = require('discord.js');

app.use(session({
    secret: 'heysuphru?nicetoseeya',
    resave: false,
    saveUninitialized: true,
    cookie: {

    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    if (!req.session.data) {
        return res.redirect('/');
    }
    res.redirect('/account')
});


app.get('/auth', async (req, res) => {

    const { query } = req;
    const { code } = query;
    if (req.session.data) {
        return res.redirect('/account');
    }

    if (code) {
        try {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}/auth`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await tokenResponseData.body.json();

            // Calculate token expiration time
            const tokenExpiration = Date.now() + (oauthData.expires_in * 1000);

            // Store access_token, refresh_token, and token expiration time in the session
            req.session.data = {
                access_token: oauthData.access_token,
                refresh_token: oauthData.refresh_token,
                token_expiration: tokenExpiration,
            };

            // Set the session cookie expiration to match the token expiration
            req.session.cookie.expires = new Date(tokenExpiration);

            const userResult = await request('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });

            const userData = await userResult.body.json();

            // Store additional user data in the session if needed
            req.session.data.user = userData;
            res.redirect('/account');
        } catch (error) {
            console.error(error);
        }
    }
    else {
        res.redirect('/')
    }
});
app.get('/account', async (req, res) => {

    if (!req.session) {
        res.redirect('/');
        return;
    }
    if (!req.session.data) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/manage/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const guild = await client.guilds.fetch(id);
        const user = guild.members.cache.get(req.session.data.user.id);
        console.log(user.permissions.has(PermissionsBitField.Flags.Administrator))

        const guildData = {
            members: guild.members.cache.filter(member => member.user.bot === false).size,
            bots: guild.members.cache.filter(member => member.user.bot === true).size,
            categories: guild.channels.cache.filter(channel => channel.type === 4).size,
            tc: guild.channels.cache.filter(channel => channel.type === 0).size,
            vc: guild.channels.cache.filter(channel => channel.type === 2).size,
            roles: guild.roles.cache.size

        };
        const member = guild.members.cache.get(client.user.id)

        const txChannel = guild.channels.cache.filter(channel => channel.type === 0)

        const guildDataJs = JSON.stringify({
            nickname: member.nickname,
            permission: user.permissions.has(PermissionsBitField.Flags.Administrator),
            guild: {
                name: guild.name,
                id: guild.id,
                icon: guild.icon,
                channels: txChannel
            }
        }).replace(/'/g, "\\'");
        req.session.guildDataJs = guildDataJs;

        // console.log(req.session.guildDataJs)

        res.render('index', {
            guild: guildData,
            data: req.session.guildDataJs,
            channel: false,
        });

    } catch (error) {
        console.log(error);
        res.status(500).sendFile(path.join(__dirname, 'erro500.html'));
    }
});

app.get('/manage/:id/channel', async (req, res) => {
    res.render('index', {
        guild: false,
        data: req.session.guildDataJs,
        channel: true
    })
});


app.get("/logout", async (req, res) => {
    req.session.destroy();
    res.send("Logged out successfully!")
});

app.get("/oops", async (req, res) => {

    res.send("Get admin permission noob")
});


app.use('/bot', bot);

app.get('*', function (req, res) {

    res.status(404).sendFile(path.join(__dirname, '404.html'));
});
app.listen(port, () => {
    console.log(`here: http://localhost:${port}`)
});