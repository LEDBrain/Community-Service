import type { ButtonInteraction } from 'discord.js';
import { prisma } from './Prisma';

export default abstract class InteractionHandler {
    db: typeof prisma;
    constructor() {
        this.db = prisma;
    }

    public abstract execute(
        button: ButtonInteraction
    ): Promise<unknown> | unknown;
}
