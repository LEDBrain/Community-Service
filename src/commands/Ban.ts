import type { CommandInteraction, GuildMember, Guild } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Ban extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Ban command')
            .addUserOption(userOption =>
                userOption
                    .setName('user')
                    .setDescription('The user to ban')
                    .setRequired(true)
            )
            .addStringOption(stringOption =>
                stringOption
                    .setName('reason')
                    .setDescription('The reason for the ban')
                    .setRequired(true)
            )
            .addBooleanOption(booleanOption =>
                booleanOption
                    .setName('force')
                    .setDescription('Force the ban')
                    .setRequired(false)
            )
            .addNumberOption(numberOption =>
                numberOption
                    .setName('days')
                    .setDescription('Number of days of messages to delete')
                    .setRequired(false)
                    .setMinValue(0)
                    .setMaxValue(1)
                    .addChoices([
                        ['0', 0],
                        ['1', 1],
                        ['2', 2],
                        ['3', 3],
                        ['4', 4],
                        ['5', 5],
                        ['6', 6],
                        ['7', 7],
                    ])
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        const member = interaction.options.getMember(
            'user',
            true
        ) as GuildMember;
        const reason = interaction.options.getString('reason', true);
        const force = interaction.options.getBoolean('force', false) ?? false;
        const days = interaction.options.getNumber('days', false) ?? 0;

        if (
            !this.canBan(
                interaction.guild,
                interaction.member as GuildMember,
                member
            )
        )
            return interaction.reply({
                content: `You cannot ban ${member.toString()}`,
                ephemeral: true,
            });

        const guildSettings = await this.db.guildSettings.findUnique({
            where: {
                id: interaction.guild.id,
            },
            select: {
                logChannelId: true,
            },
        });
        if (!guildSettings?.logChannelId.length)
            return interaction.reply({
                content: 'No log channel set',
                ephemeral: true,
            });

        await interaction.reply(
            `${member.user.tag} has been banned for ${reason} (force: ${force}; days: ${days})`
        );
    }

    public canBan(guild: Guild, moderator: GuildMember, user: GuildMember) {
        return (
            (guild.ownerId === moderator.id ||
                guild.ownerId !== user.id ||
                (user.roles.highest.position >=
                    moderator.roles.highest.position &&
                    moderator.permissions.has('BAN_MEMBERS'))) &&
            moderator.id !== user.id
        );
    }
}
