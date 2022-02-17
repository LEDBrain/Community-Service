import { Intents } from 'discord.js';
import Client from './base/Client';
import fs from 'fs/promises';

import dotenv from 'dotenv';
import type Event from './base/Event';
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
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
})();

client.login(process.env.DISCORD_TOKEN);

export { client };
