import type { Interaction, SlashCommandBuilder } from 'discord.js';
import type { TimerOptions } from 'node:timers';
import util from 'node:util';
import Base from './Base.js';
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

    public abstract execute(
        interaction: Interaction
    ): Promise<unknown> | unknown;

    constructor({ name, description, options = [] }: Config) {
        super();
        this.name = name;
        this.description = description;
        this.options = options;
        this.wait = wait;
    }
}
