import type { Interaction } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';
import util from 'util';
import type { TimerOptions } from 'node:timers';
import SanctionManager from './SanctionManager';
import Base from './Base';
const wait = util.promisify(setTimeout);

export interface Config {
    name: string;
    description: string;
    options?: ReturnType<SlashCommandBuilder['toJSON']>['options'];
}

export default abstract class Command extends Base implements Config {
    name: string;
    description: string;
    options?: ReturnType<SlashCommandBuilder['toJSON']>['options'];
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
        super();
        this.name = name;
        this.description = description;
        this.options = options;
        this.wait = wait;
        this.Sanction = SanctionManager;
    }
}
