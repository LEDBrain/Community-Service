import { Collection, Client as DiscordClient } from 'discord.js';
import type Command from './Command.js';

export default class Client extends DiscordClient {
    commands = new Collection<string, Command>();

    constructor(options: ConstructorParameters<typeof DiscordClient>[0]) {
        super(options);
    }
}
