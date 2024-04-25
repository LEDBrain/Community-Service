import type { VoiceState } from 'discord.js';
import { EmbedBuilder, Events } from 'discord.js';
import type Client from '../base/Client.js';
import Event from '../base/Event.js';

export default class VoiceStateUpdate extends Event {
    constructor() {
        super({ name: Events.VoiceStateUpdate });
    }
    public async execute(
        _client: Client,
        oldState: VoiceState,
        newState: VoiceState
    ) {
        if (!oldState.member || !newState.member) return;
        // console.log(oldState.channelId, newState.channelId ?? 'NULL');

        const embed = this.compareVoiceStates(oldState, newState);

        this.log(newState.guild ? newState.guild : oldState.guild, {
            embeds: [embed],
        });
    }

    private compareVoiceStates(
        oldState: VoiceState,
        newState: VoiceState
    ): EmbedBuilder {
        const basicEmbed = new EmbedBuilder()
            .setAuthor({
                name: newState.member?.user.tag ?? '',
                iconURL: newState.member?.user.avatarURL() ?? undefined,
            })
            .setTimestamp()
            .setFooter({ text: `Community Service ${this.version}` });

        if (!oldState?.channelId && newState.channelId) {
            basicEmbed
                .setDescription(
                    `**${newState.member?.user.tag}** joined: ${newState.channel}.`
                )
                .addFields([
                    {
                        name: 'New Voice Channel',
                        value: `${newState.channel}`,
                    },
                ]);
        }

        if (oldState.channelId && !newState.channelId) {
            basicEmbed
                .setDescription(
                    `**${newState.member?.user.tag}** left: ${oldState.channel}.`
                )
                .addFields([
                    {
                        name: 'Old Voice Channel',
                        value: `${oldState.channel}`,
                    },
                ]);
        }

        if (
            oldState.channelId !== newState.channelId &&
            oldState?.channelId &&
            newState?.channelId
        ) {
            basicEmbed
                .setDescription(
                    `**${newState.member?.user.tag}** moved to: ${newState.channel}.`
                )
                .addFields([
                    {
                        name: 'Old Voice Channel',
                        value: `${oldState.channel}`,
                    },
                    {
                        name: 'New Voice Channel',
                        value: `${newState.channel}`,
                    },
                ]);
        }
        return basicEmbed;
    }
}
