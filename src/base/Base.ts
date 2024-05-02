import type { GuildSettings } from '@prisma/client';
import type { Guild, TextChannel } from 'discord.js';
import { ChannelType } from 'discord.js';
import packageJson from '../../package.json' with { type: "json"};
import { prisma } from './Prisma.js';
import SanctionManager from './SanctionManager.js';

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
        if (!channel || channel.type !== ChannelType.GuildText) return;

        return await channel.send(options);
    }
    get version() {
        return `v${packageJson.version}`;
    }
}
