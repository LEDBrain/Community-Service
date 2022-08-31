import Event from '../base/Event';
import type { GuildMember } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type Client from '../base/Client';

export default class GuildMemberUpdate extends Event {
    constructor() {
        super({ name: 'guildMemberUpdate' });
    }
    public async execute(
        _: Client,
        oldMember: GuildMember,
        newMember: GuildMember
    ) {
        const diff = newMember.roles.cache.difference(oldMember.roles.cache);
        if (diff.size === 0) return;
        let name = '';
        if (oldMember.roles.cache.hasAll(...diff.map(e => e.id)))
            name = 'Roles removed';
        else name = 'Roles added';
        const roleUpdateEmbed = new EmbedBuilder()
            .setTitle('User updated')
            .setAuthor({
                name: newMember.user.tag,
                iconURL:
                    newMember.avatarURL() || newMember.user.displayAvatarURL(),
            })
            .setFields([{ name, value: diff.map(r => r.name).join(', ') }])
            .setTimestamp()
            .setColor('Orange');
        this.log(newMember.guild, { embeds: [roleUpdateEmbed] });
    }
}
