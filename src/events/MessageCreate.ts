// This file is optional since this uses
// /-Commands

import Event from '../base/Event';
import type { Message } from 'discord.js';
import { ChannelType } from 'discord.js';
import type Client from '../base/Client';
export default class MessageCreate extends Event {
    constructor() {
        super({ name: 'messageCreate' });
    }
    public async execute(_: Client, message: Message) {
        if (
            message.content.toLowerCase() === 'deploy' &&
            message.author.id === '199964094357307392' // Change this to the bot admin/dev id
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
