import { GatewayIntentBits, Options } from 'discord.js';
import fs from 'node:fs/promises';
import Client from './base/Client.js';
import type Event from './base/Event.js';

// Load environment variables
import 'dotenv/config';
import { env } from './env.js';

// Create discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
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

// Load event handlers
(async () => {
    const eventFiles = (await fs.readdir('./src/events')).filter(
        file => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of eventFiles) {
        const event = new (await import(`./events/${file}`)).default() as Event;
        if (event.once) {
            client.once(event.name, (...args) =>
                event.execute(client, ...args)
            );
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }
})();

client.login(env.DISCORD_TOKEN).then(() => import('./api/server.js'));

export { client };
