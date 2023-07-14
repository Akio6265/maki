const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Partials, IntentsBitField, Options, Events } = require('discord.js');
const { token } = require('../config.json');


const myIntents = new IntentsBitField();
myIntents.add(IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildModeration);

const client = new Client({
	fetchAllMembers: true,
	intents: myIntents

});

module.exports = client;
client.commands = new Collection();
client.reg_cmd = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
};

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}

}

const reg_cmd = path.join(__dirname, 'reg_cmds')
const reg_cmd_folder = fs.readdirSync(reg_cmd);

for (const sub_folder of reg_cmd_folder) {

	const sub_folder_path = path.join(reg_cmd, sub_folder);
	const main_files = fs.readdirSync(sub_folder_path).filter(fk => fk.endsWith('.js'))

	for (const file_path of main_files) {
		const file = path.join(sub_folder_path, file_path)
		const command = require(file);
		client.reg_cmd.set(command.name, command);
	}
}
// console.log(client)
const { prefix } = require('../config.json')
client.on(Events.MessageCreate, (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	// client.commands.set(pong.name, pong)
	const command = client.reg_cmd.get(commandName) // || yoimiya.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return message.react('<:YaeMikoWatching:1113478319535554610>').then(() => {
		message.reply('I dont have this command...')
			.then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 1000);

			});
	}).catch(err => console.log(err));
	command.execute(message, args);
});

client.login(token);
