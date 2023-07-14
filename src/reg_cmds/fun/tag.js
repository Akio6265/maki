const { Tags } = require("../../db");



module.exports = {
    name: 'tag',
    description: 'tagsssssssss',
    execute: async (message, arg) => {
        if (!arg[0]) return message.reply('use : ``!tag <name> <message>``');//in case of empty message
        //[name, description]
        const data = await Tags.findAll({ order: [['name', 'ASC']] });
        const tagName = arg[0]; //name
        const tagDescription = arg.slice(1).join(' ');//description
        if (tagName === 'delete') return message.channel.send('you cant set it as a tag');//no delete allowed
        let tagExist = true;
        data.forEach(elem => {
            if (elem.name === tagName) {
                if (tagDescription) {
                    Tags.update({ description: tagDescription }, { where: { name: tagName } }).catch((err) => { console.log(err, 'no gg') });//updating tag's message
                    tagExist = false;
                    message.channel.send('done');
                    return;
                }
                else {
                    tagExist = false;
                    message.reply(`sir/mam, tag "${tagName}" already exists`);
                    return;
                };
            };
        });
        if (!tagExist) return;
        else if (!tagName || !tagDescription) {
            return message.reply('Do: ``!tag <name> <message>``');
        }
        else {
            try {
                const tag = await Tags.create({
                    name: tagName,
                    description: tagDescription
                })
                tag.save()
                await message.reply(`added tag ${tag.name}`);
            }
            catch (error) {
                await message.reply(`some error appeared`);
                console.log(error)
            }
        }
    }
}