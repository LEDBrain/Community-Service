import { Interaction, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { prisma } from './Prisma';
import util from 'util';
import { TimerOptions } from 'node:timers';
import SanctionManager from './SanctionManager';
const wait = util.promisify(setTimeout);

export interface Config {
    name: string;
    description: string;
    options?: ReturnType<SlashCommandBuilder['toJSON']>['options'];
}

export default abstract class Command implements Config {
    name: string;
    description: string;
    options?: ReturnType<SlashCommandBuilder['toJSON']>['options'];
    db: typeof prisma;
    wait: <T = void>(
        delay?: number,
        value?: T,
        options?: TimerOptions
    ) => Promise<T>;
    Sanction: typeof SanctionManager;

    public abstract execute(
        interaction: Interaction
    ): Promise<unknown> | unknown;

    constructor({ name, description, options = null }: Config) {
        this.name = name;
        this.description = description;
        this.options = options;
        this.db = prisma;
        this.wait = wait;
        this.Sanction = SanctionManager;
    }
}
