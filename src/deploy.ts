import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'node:fs/promises';
import type Command from './base/Command.js';

import { env } from './env.js';
import { client } from './index.js';

// Load all commands into the client.commands Collection
const updateCommands = async () => {
    const commandFiles = (await fs.readdir('./src/commands')).filter(
        file => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const command = new (
            await import(`./commands/${file}`)
        ).default() as Command;
        console.log({
            name: command.name,
            description: command.description,
            options: command.options,
        });
        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        client.commands.set(command.name, command);
    }
};

const rest = new REST({ version: '9' }).setToken(env.DISCORD_TOKEN);

// Send all commands to the Discord API
export default async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await updateCommands();

        const commands = client.commands.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ execute, db, wait, Sanction, ...data }) => data
        );
        console.log(commands);

        //  Use this when in development phase
        if (env.NODE_ENV === 'development') {
            await rest.put(
                Routes.applicationGuildCommands(
                    env.DISCORD_CLIENT_ID,
                    env.DISCORD_DEV_GUILD_ID
                ),
                {
                    body: commands,
                }
            );
        } else if (env.NODE_ENV === 'production') {
            if (!client.isReady()) return;
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: commands,
            });
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};
