import type { GuildSettings } from '@prisma/client';
import { ChannelType } from 'discord.js';
import type { Guild, TextChannel } from 'discord.js';
import { prisma } from './Prisma';
import SanctionManager from './SanctionManager';
import { loadNamespaceAsync } from '../i18n/i18n-util.async';
import type {
    Locales,
    Namespaces,
    TranslationFunctions,
    Translations,
} from '../i18n/i18n-types';
import L from 'i18n/i18n-node';
import type { LocaleTranslationFunctions } from 'typesafe-i18n';
import { i18n, i18nObject } from '../i18n/i18n-util';

export default abstract class Base {
    db: typeof prisma;
    Sanction: typeof SanctionManager;
    t: TranslationFunctions;
    constructor() {
        this.db = prisma;
        this.Sanction = SanctionManager;
        this.t = i18nObject('en');
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
    async loadNS(locale: Locales, ns: Namespaces) {
        await loadNamespaceAsync(locale, ns);
    }
    async setLanguage(locale?: Locales) {
        this.t = i18nObject(locale ?? 'en');
    }
}
