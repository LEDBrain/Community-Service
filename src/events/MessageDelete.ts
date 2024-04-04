import type { Guild, GuildAuditLogsEntry } from 'discord.js';
import { AuditLogEvent, EmbedBuilder, Events, channelLink } from 'discord.js';
import type Client from '../base/Client';
import Event from '../base/Event';

export default class MessageDelete extends Event {
    constructor() {
        super({ name: Events.GuildAuditLogEntryCreate });
    }
    public async execute(
        client: Client,
        auditLog: GuildAuditLogsEntry,
        guild: Guild
    ) {
        const isMessageDeleteAuditLogEntry = (
            auditLog: GuildAuditLogsEntry
        ): auditLog is GuildAuditLogsEntry<AuditLogEvent.MessageDelete> =>
            auditLog.action === AuditLogEvent.MessageDelete;

        // Define your variables.
        // The extra information here will be the channel.
        if (!isMessageDeleteAuditLogEntry(auditLog)) return;
        const {
            extra: { channel },
            executorId,
            targetId,
        } = auditLog;

        // Type checks
        if (executorId === null || targetId === null) return;

        const resolvedChannel =
            'guild' in channel
                ? channel
                : await guild.channels.fetch(channel.id);
        if (!resolvedChannel) return;

        // Ensure the executor is cached.
        const executor = await client.users.fetch(executorId);

        // Ensure the author whose message was deleted is cached.
        const target = await client.users.fetch(targetId);

        const embed = new EmbedBuilder()
            .setTitle('A message was deleted')
            .addFields([
                {
                    name: ' ',
                    value: channelLink(channel.id),
                },
                {
                    name: 'From',
                    value: target.toString(),
                },
                {
                    name: 'Deleted by',
                    value: executor.toString(),
                },
            ]);

        this.log(resolvedChannel.guild, {
            embeds: [embed],
        });
    }
}
