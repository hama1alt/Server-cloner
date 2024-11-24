const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Replace this with your bot token
const BOT_TOKEN = 'YOUR_TOKEN_HERE';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Command to clone the server
client.on('messageCreate', async (message) => {
    if (message.content === '!clone') {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You need administrator permissions to use this command!');
        }

        const originalGuild = message.guild;

        // Create a new server
        const newGuild = await message.client.guilds.create(`${originalGuild.name} Clone`, {
            icon: originalGuild.iconURL({ format: 'png' }),
        });

        // Clone categories and channels
        for (const category of originalGuild.channels.cache
            .filter((ch) => ch.type === 4) // Filter only category channels
            .values()) {
            const newCategory = await newGuild.channels.create(category.name, {
                type: 4, // Category type
            });

            for (const channel of category.children.values()) {
                await newGuild.channels.create(channel.name, {
                    type: channel.type,
                    parent: newCategory,
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    bitrate: channel.bitrate,
                    userLimit: channel.userLimit,
                    rateLimitPerUser: channel.rateLimitPerUser,
                });
            }
        }

        // Clone non-categorized channels
        for (const channel of originalGuild.channels.cache
            .filter((ch) => !ch.parent)
            .values()) {
            await newGuild.channels.create(channel.name, {
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                rateLimitPerUser: channel.rateLimitPerUser,
            });
        }

        message.channel.send(`Cloned server structure to ${newGuild.name}`);
    }
});

client.login(BOT_TOKEN);
