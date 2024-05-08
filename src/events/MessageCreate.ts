// This file is optional since this uses
// /-Commands

import type { Message } from 'discord.js';
import { ChannelType } from 'discord.js';
import type Client from '../base/Client.js';
import Event from '../base/Event.js';
import { env } from '../env.js';

export default class MessageCreate extends Event {
    constructor() {
        super({ name: 'messageCreate' });
    }
    public async execute(_: Client, message: Message) {
        if (
            message.content.toLowerCase() === 'deploy' &&
            message.author.id === env.DISCORD_ADMIN_ID
        ) {
            console.log(`Deploying...`);
            (await import('../deploy')).default();
        }
        if (
            message.channel.type === ChannelType.GuildAnnouncement &&
            message.crosspostable &&
            message.inGuild() &&
            (
                await this.db.guildSettings.findUnique({
                    where: { id: message.guildId },
                })
            )?.crosspostChannels.includes(message.channelId)
        ) {
            message.crosspost();
        }
    }
}
