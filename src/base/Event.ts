import Client from './Client';
import Keyv from '@keyvhq/core';
// import keyv from '../db';

export interface EventConfig {
    name: string;
    once?: boolean;
}

export default abstract class Event {
    name: string;
    once: boolean;
    // db: Keyv;
    constructor({ name, once = false }: EventConfig) {
        this.name = name;
        this.once = once;
        // this.db = keyv;
    }
    public abstract execute(client: Client, ...args: unknown[]): void;
}
