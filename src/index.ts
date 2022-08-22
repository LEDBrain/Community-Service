import { GatewayIntentBits, Options } from 'discord.js';
import Client from './base/Client';
import fs from 'fs/promises';

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
    ],
    sweepers: {
        messages: {
            interval: 43200, // 12 hours
            lifetime: 21600, // 6 hours,
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
    //
})();

client.login(process.env.DISCORD_TOKEN).then(() => import('./api/server'));

export { client };
