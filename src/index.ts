import { GatewayIntentBits, Options, Partials } from 'discord.js';
import Client from './base/Client';
import fs from 'fs/promises';
import { prisma } from './base/Prisma';
import dotenv from 'dotenv';
import type Event from './base/Event';
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.Reaction],
    sweepers: {
        messages: {
            interval: 43200, // 12 hours
            lifetime: 21600, // 6 hours
        },
    },
    makeCache: Options.cacheWithLimits({
        MessageManager: 100,
    }),
});

(async () => {
    const eventFiles = (await fs.readdir(__dirname + '/events')).filter(
        file => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of eventFiles) {
        const event = new (
            await import(`${__dirname}/events/${file}`)
        ).default() as Event;
        if (event.once) {
            client.once(event.name, (...args) =>
                event.execute(client, ...args)
            );
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }

    /* Initialize Reaction Role */
    const reactionRoleMsgs = await prisma.reactionRoleMessage.findMany({
        select: {
            guildId: true,
            channelId: true,
            messageId: true,
        },
    });
    for (const msg of reactionRoleMsgs) {
        client.guilds
            .fetch({ guild: msg.guildId, cache: false, force: true })
            .then(guild => {
                guild.channels
                    .fetch(msg.channelId)
                    .then(channel => {
                        if (!channel || !channel.isTextBased()) return;
                        channel.messages
                            .fetch(msg.messageId)
                            .then(async message => {
                                await message.fetch();
                            })
                            .catch(console.error);
                    })
                    .catch(console.error);
            });
    }
})();

client.login(process.env.DISCORD_TOKEN).then(() => import('./api/server'));

export { client };
