import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Colors, Date as DateUtils } from '../utils';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        const embed = new MessageEmbed()
            .setColor(Colors.fromString(interaction.guild.name))
            .setDescription(interaction.guild.name)
            .setFields([
                {
                    name: 'Serverowner',
                    value: `${interaction.guild.members.resolve(
                        interaction.guild.ownerId
                    )}`,
                    inline: true,
                },
                {
                    name: 'Created at',
                    value: `${DateUtils.format(interaction.guild.createdAt)}`,
                },
                {
                    name: 'Member count',
                    value: `${interaction.guild.memberCount}`,
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
                    ].join(',\n'),
                },
            ]);

        interaction.reply({ embeds: [embed] });
    }
}
