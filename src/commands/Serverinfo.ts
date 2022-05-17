import type { CommandInteraction, Guild } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Colors, Date as DateUtils } from '../utils';

export default class Serverinfo extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('Serverinfo command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        const embed = new MessageEmbed()
            .setColor(Colors.fromString((interaction.guild as Guild).name))
            .setDescription((interaction.guild as Guild).name)
            .setFields([
                {
                    name: 'Serverowner',
                    value: `${(interaction.guild as Guild).members.resolve(
                        (interaction.guild as Guild).ownerId
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
                            c => c.type === 'GUILD_CATEGORY'
                        ).size
                    }\nVoice: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === 'GUILD_VOICE' ||
                                c.type === 'GUILD_STAGE_VOICE'
                        ).size
                    }\nText: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === 'GUILD_TEXT' ||
                                c.type === 'GUILD_NEWS' ||
                                c.type === 'GUILD_STORE'
                        ).size
                    }\nThreads: ${
                        (interaction.guild as Guild).channels.cache.filter(
                            c =>
                                c.type === 'GUILD_PUBLIC_THREAD' ||
                                c.type === 'GUILD_NEWS_THREAD'
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
