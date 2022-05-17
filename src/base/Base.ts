import type { GuildSettings } from '@prisma/client';
import type { Guild, TextChannel } from 'discord.js';
import { prisma } from './Prisma';
import SanctionManager from './SanctionManager';

export default abstract class Base {
    db: typeof prisma;
    Sanction: typeof SanctionManager;
    constructor() {
        this.db = prisma;
        this.Sanction = SanctionManager;
    }
    async getGuildSettings(guildId: string): Promise<GuildSettings | null> {
        return await this.db.guildSettings.findUnique({
            where: {
                id: guildId,
            },
        });
    }
    async log(
        guild: Guild,
        options: Parameters<TextChannel['send']>[0]
    ): Promise<ReturnType<TextChannel['send']> | undefined> {
        const guildSettings = await this.getGuildSettings(guild.id);
        if (!guildSettings?.logChannelId) {
            return;
        }
        const channel = await guild.channels.fetch(guildSettings.logChannelId);
        if (!channel || !channel.isText()) return;

        return await channel.send(options);
    }
}
