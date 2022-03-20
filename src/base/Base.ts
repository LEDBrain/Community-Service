import type { GuildSettings } from '@prisma/client';
import { prisma } from './Prisma';

export default abstract class Base {
    db: typeof prisma;
    constructor() {
        this.db = prisma;
    }
    async getGuildSettings(guildId: string): Promise<GuildSettings> {
        return await this.db.guildSettings.findUnique({
            where: {
                id: guildId,
            },
        });
    }
}
