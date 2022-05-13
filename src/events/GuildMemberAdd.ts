import Event from '../base/Event';
import type { GuildMember } from 'discord.js';
import type Client from '../base/Client';

export default class GuildMemberAdd extends Event {
    constructor() {
        super({ name: 'guildMemberAdd' });
    }
    public async execute(_: Client, member: GuildMember) {
        const guildSettings = await this.getGuildSettings(member.guild.id);
        if (
            !guildSettings?.welcomeChannelId ||
            guildSettings?.disabledCommands.includes(this.name)
        )
            return;
        const channel = await member.guild.channels.fetch(
            guildSettings.welcomeChannelId
        );
        if (!channel || !channel.isText()) return;
        const message = guildSettings.welcomeMessage
            .replaceAll('{{servername}}', channel.guild.toString())
            .replaceAll('{{username}}', member.toString());
        channel.send(message); // TODO: Make this text editable (command & dashboard)
    }
}
