import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import type Command from './base/Command';
import fs from 'fs/promises';

import { client } from './index';

// Load all commands into the client.commands Collection
const updateCommands = async () => {
    const commandFiles = (await fs.readdir(__dirname + '/commands')).filter(
        file => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const command = new (
            await import(`${__dirname}/commands/${file}`)
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

const rest = new REST({ version: '9' }).setToken(
    process.env.DISCORD_TOKEN as string
);

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
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID as string,
                process.env.DISCORD_DEV_GUILD_ID as string
            ),
            {
                body: commands,
            }
        );

        // await rest.put(Routes.applicationCommands(client.user.id), {
        //     body: commands,
        // });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    try {
        console.log('Started refreshing Linked Roles.');
        // supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8
        const body = [
            {
                key: 'game_de',
                name: 'Leistellenspiel.de',
                description: 'Leistellenspiel.de',
                type: 7,
            },
        ];
        await rest.put(
            Routes.applicationRoleConnectionMetadata(
                process.env.DISCORD_CLIENT_ID as string
            ),
            {
                body,
            }
        );
        console.log('Successfully reloaded Linked Roles.');
    } catch (error) {
        console.error(error);
    }
};
