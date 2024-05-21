import type { VoiceState } from 'discord.js';
import { EmbedBuilder, Events } from 'discord.js';
import type Client from '../base/Client.js';
import Event from '../base/Event.js';

enum VoiceEvents {
    'join',
    'leave',
    'move',
}

interface CompareVoiceStatesReturn {
    embed: EmbedBuilder;
    event: VoiceEvents | null;
}

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

        const comparedVoiceStates = this.compareVoiceStates(oldState, newState);

        if (comparedVoiceStates.event)
            this.log(newState.guild ? newState.guild : oldState.guild, {
                embeds: [comparedVoiceStates.embed],
            });
    }

    private compareVoiceStates(
        oldState: VoiceState,
        newState: VoiceState
    ): CompareVoiceStatesReturn {
        const basicEmbed = new EmbedBuilder()
            .setAuthor({
                name: newState.member?.user.tag ?? '',
                iconURL: newState.member?.user.avatarURL() ?? undefined,
            })
            .setTimestamp()
            .setFooter({ text: `Community Service ${this.version}` });

        let voiceEvent: CompareVoiceStatesReturn['event'] = null;

        if (!oldState?.channelId && newState.channelId) {
            basicEmbed
                .setDescription(
                    `**${newState.member}** joined: ${newState.channel}.`
                )
                .addFields([
                    {
                        name: 'New Voice Channel',
                        value: `${newState.channel}`,
                    },
                ]);
            voiceEvent = VoiceEvents.join;
        }

        if (oldState.channelId && !newState.channelId) {
            basicEmbed
                .setDescription(
                    `**${newState.member}** left: ${oldState.channel}.`
                )
                .addFields([
                    {
                        name: 'Old Voice Channel',
                        value: `${oldState.channel}`,
                    },
                ]);
            voiceEvent = VoiceEvents.leave;
        }

        if (
            oldState.channelId !== newState.channelId &&
            oldState?.channelId &&
            newState?.channelId
        ) {
            basicEmbed
                .setDescription(
                    `**${newState.member}** moved to: ${newState.channel}.`
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
            voiceEvent = VoiceEvents.leave;
        }

        return { embed: basicEmbed, event: voiceEvent };
    }
}
