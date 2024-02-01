import type { ChatInputCommandInteraction, Guild } from 'discord.js';
import { ChannelType } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { Colors, Date as DateUtils } from '../utils';

export default class Serverinfo extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('Serverinfo command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor(Colors.fromString((interaction.guild as Guild).name))
            .setDescription((interaction.guild as Guild).name)
            .setFields([
                {
                    name: 'Serverowner',
                    value: `${(interaction.guild as Guild).members.resolve(
                        await (interaction.guild as Guild).fetchOwner()
                    )}`,
                },
                {
                    name: 'Created at',
                    value: `${DateUtils.format(
                        (interaction.guild as Guild).createdAt
                    )}`,
                    inline: true,
                },
                {
                    name: 'Member count',
                    value: `${(interaction.guild as Guild).memberCount}`,
                    inline: true,
                },
                {
                    name: 'Channels',
                    inline: true,
                    value: `Total: ${
                        (interaction.guild as Guild).channels.cache.size
                    }\nCategories: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c => c.type === ChannelType.GuildCategory
                        ).size
                    }\nVoice: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === ChannelType.GuildVoice ||
                                c.type === ChannelType.GuildStageVoice
                        ).size
                    }\nText: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === ChannelType.GuildText ||
                                c.type === ChannelType.GuildNews
                        ).size
                    }\nThreads: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === ChannelType.GuildPublicThread ||
                                c.type === ChannelType.GuildNewsThread
                        ).size
                    }`,
                },
                {
                    name: `Roles: ${
                        (interaction.guild as Guild).roles.cache.size
                    }`,
                    value: [
                        ...(interaction.guild as Guild).roles.cache
                            .sort(
                                (first, second) =>
                                    second.position - first.position
                            )
                            .values(),
                    ].join(', '),
                },
            ])
            .setThumbnail((interaction.guild as Guild).iconURL() ?? '')
            .setFooter({
                text: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            });

        interaction.reply({ embeds: [embed] });
    }
}
