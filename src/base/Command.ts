import { Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Keyv from '@keyvhq/core';
// import keyv from '../db';
import util from 'util';
import { TimerOptions } from 'node:timers';
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
    // db: Keyv;
    wait: <T = void>(
        delay?: number,
        value?: T,
        options?: TimerOptions
    ) => Promise<T>;

    public abstract execute(
        interaction: Interaction
    ): Promise<unknown> | unknown;

    constructor({ name, description, options = null }: Config) {
        this.name = name;
        this.description = description;
        this.options = options;
        // this.db = keyv;
        this.wait = wait;
    }
}
