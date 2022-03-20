import type {
    CommandInteraction,
    GuildMember,
    Guild,
    TextChannel,
} from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { MessageEmbed } from 'discord.js';
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

        if (force) {
            await member.ban({
                reason: reason,
                days: days,
            });
            await interaction.reply({
                content: `Banned ${member.toString()}`,
                ephemeral: true,
            });
            return;
        }

        const banRequests = await this.db.banRequest.findFirst({
            where: {
                AND: {
                    guildId: interaction.guild.id,
                    userId: member.id,
                },
            },
        });
        if (banRequests)
            return interaction.reply(
                `There is already a ban request for ${member.toString()} (see it here: https://discord.com/channels/${
                    interaction.guild.id
                }/${guildSettings.logChannelId}/${banRequests.messageId})`
            );

        const banEmbed = new MessageEmbed()
            .setTitle('Ban request')
            .setColor('#ff0000')
            .addFields([
                {
                    name: 'User to be banned',
                    value: member.toString(),
                    inline: true,
                },
                {
                    name: 'Moderator',
                    value: interaction.member.toString(),
                    inline: true,
                },
                {
                    name: 'Messages to delete',
                    value: `Days: ${days}`,
                    inline: true,
                },
            ])
            .setDescription(`Reason:\n${reason}`);
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('banRequestApprove')
                .setLabel('Approve')
                .setStyle('DANGER')
                .setEmoji('✅'),
            new MessageButton()
                .setCustomId('banRequestReject')
                .setLabel('Reject')
                .setStyle('PRIMARY')
                .setEmoji('❌')
        );

        const message = await (
            (await interaction.guild.channels.fetch(
                guildSettings.logChannelId
            )) as TextChannel
        ).send({
            embeds: [banEmbed],
            components: [row],
        });

        await this.db.banRequest.create({
            data: {
                guildId: interaction.guild.id,
                messageId: message.id,
                userId: member.id,
                moderatorId: (interaction.member as GuildMember).id,
                reason,
                daysToDelete: days,
            },
        });

        await interaction.reply(
            `I've created a ban request for ${member.toString()} (see it here: https://discord.com/channels/${
                interaction.guildId
            }/${guildSettings.logChannelId}/${message.id})`
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
