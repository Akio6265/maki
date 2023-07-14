const { codeBlock } = require("discord.js");
const { Tags } = require("../../db");
module.exports = {
    name: 'tags',
    description: 'tags all tags or delete tag',
    execute: async (message, arg) => {
        if (!arg[0]) return message.reply('`!tags all\n!tags delete <TagName>`');
        const data = await Tags.findAll({ order: [['name', 'ASC']] });
        const cmd = arg.shift().toLowerCase();//[delete,tag]
        switch (cmd) {
            case 'delete':
                const gTag = arg[0]; //name
                if (!gTag) return;
                let bool = true;
                data.forEach(async elem => {
                    if (elem.name === gTag) {
                        bool = false;
                        await Tags.destroy({ where: { name: gTag } }).catch((err) => {
                            console.log(err)
                        })
                        await message.channel.send(gTag + ' deleted')
                    }
                })
                if (bool) {
                    await message.channel.send('tag doesnt exist ._. ');
                }
                break;
            case 'all':
                let txt = data.map((d) => `${d.name}`).join('\n')
                const bs = codeBlock(txt);
                message.reply(bs);
                break;
        }
    }
}