import type Client from './Client';
import { prisma } from './Prisma';

export interface EventConfig {
    name: string;
    once?: boolean;
}

export default abstract class Event {
    name: string;
    once: boolean;
    db: typeof prisma;
    constructor({ name, once = false }: EventConfig) {
        this.name = name;
        this.once = once;
        this.db = prisma;
    }
    public abstract execute(client: Client, ...args: unknown[]): void;
}
