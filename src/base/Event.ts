import Base from './Base';
import type Client from './Client';

export interface EventConfig {
    name: string;
    once?: boolean;
}

export default abstract class Event extends Base {
    name: string;
    once: boolean;
    constructor({ name, once = false }: EventConfig) {
        super();
        this.name = name;
        this.once = once;
    }
    public abstract execute(client: Client, ...args: unknown[]): void;
}
