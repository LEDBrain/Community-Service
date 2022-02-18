import type { CommandInteraction } from 'discord.js';
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
        if (!this.isEnabled(interaction.guild.id)) return;
        const embed = new MessageEmbed()
            .setColor(Colors.fromString(interaction.guild.name))
            .setDescription(interaction.guild.name)
            .setFields([
                {
                    name: 'Serverowner',
                    value: `${interaction.guild.members.resolve(
                        interaction.guild.ownerId
                    )}`,
                },
                {
                    name: 'Created at',
                    value: `${DateUtils.format(interaction.guild.createdAt)}`,
                    inline: true,
                },
                {
                    name: 'Member count',
                    value: `${interaction.guild.memberCount}`,
                    inline: true,
                },
                {
                    name: 'Channels',
                    inline: true,
                    value: `Total: ${
                        interaction.guild.channels.cache.size
                    }\nCategories: ${
                        interaction.guild.channels.cache.filter(
                            c => c.type === 'GUILD_CATEGORY'
                        ).size
                    }\nVoice: ${
                        interaction.guild.channels.cache.filter(
                            c =>
                                c.type === 'GUILD_VOICE' ||
                                c.type === 'GUILD_STAGE_VOICE'
                        ).size
                    }\nText: ${
                        interaction.guild.channels.cache.filter(
                            c =>
                                c.type === 'GUILD_TEXT' ||
                                c.type === 'GUILD_NEWS' ||
                                c.type === 'GUILD_STORE'
                        ).size
                    }\nThreads: ${
                        interaction.guild.channels.cache.filter(
                            c =>
                                c.type === 'GUILD_PUBLIC_THREAD' ||
                                c.type === 'GUILD_NEWS_THREAD'
                        ).size
                    }`,
                },
                {
                    name: `Roles: ${interaction.guild.roles.cache.size}`,
                    value: [
                        ...interaction.guild.roles.cache
                            .sort(
                                (first, second) =>
                                    second.position - first.position
                            )
                            .values(),
                    ].join(', '),
                },
            ])
            .setThumbnail(interaction.guild.iconURL())
            .setFooter(
                interaction.user.tag,
                interaction.user.displayAvatarURL()
            );

        interaction.reply({ embeds: [embed] });
    }
}
