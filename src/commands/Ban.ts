import type {
    CommandInteraction,
    GuildMember,
    Guild,
    Message,
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
            .addBooleanOption(
                booleanOption =>
                    booleanOption
                        .setName('force')
                        .setDescription('Force the ban')
                        .setRequired(true) // Change this when the issue with weird discord errors is fixed
            )
            .addNumberOption(numberOption =>
                numberOption
                    .setName('days')
                    .setDescription('Number of days of messages to delete')
                    .setRequired(true) // Change this when the issue with weird discord errors is fixed
                    .setMinValue(0)
                    .setMaxValue(1)
                    .addChoices(
                        { name: '0', value: 0 },
                        { name: '1', value: 1 },
                        { name: '2', value: 2 },
                        { name: '3', value: 3 },
                        { name: '4', value: 4 },
                        { name: '5', value: 5 },
                        { name: '6', value: 6 },
                        { name: '7', value: 7 }
                    )
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
                interaction.guild as Guild,
                interaction.member as GuildMember,
                member
            )
        )
            return interaction.reply({
                content: `You cannot ban ${member.toString()}`,
                ephemeral: true,
            });

        const guildSettings = await this.getGuildSettings(
            interaction.guildId as string
        );

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
            await this.log(interaction.guild as Guild, {
                embeds: [
                    new MessageEmbed()
                        .setTitle('User banned')
                        .setColor('#ff0000')
                        .setDescription(
                            `This Ban was forced by the moderator!\n**Reason:**\n${reason}`
                        )
                        .addFields([
                            {
                                name: 'User',
                                value: member.toString(),
                                inline: true,
                            },
                            {
                                name: 'Moderator',
                                value: (
                                    interaction.member as GuildMember
                                ).toString(),
                                inline: true,
                            },
                            {
                                name: 'Messages to delete',
                                value: `Days: ${days}`,
                                inline: true,
                            },
                        ]),
                ],
            });
            return;
        }

        const banRequests = await this.db.banRequest.findFirst({
            where: {
                AND: {
                    guildId: (interaction.guild as Guild).id,
                    userId: member.id,
                    isRejected: false,
                },
            },
        });
        if (banRequests)
            return interaction.reply(
                `There already is a ban request for ${member.toString()} (see it here: https://discord.com/channels/${
                    (interaction.guild as Guild).id
                }/${guildSettings.logChannelId}/${banRequests.messageId})`
            );

        const banEmbed = new MessageEmbed()
            .setTitle('[OPEN] Ban request')
            .setColor('#ff0000')
            .addFields([
                {
                    name: 'User to be banned',
                    value: member.toString(),
                    inline: true,
                },
                {
                    name: 'Moderator',
                    value: (interaction.member as GuildMember).toString(),
                    inline: true,
                },
                {
                    name: 'Messages to delete',
                    value: `Days: ${days}`,
                    inline: true,
                },
                {
                    name: `Approved By (0/${guildSettings.banApprovalsNeeded})`,
                    value: 'None',
                },
            ])
            .setDescription(`**Reason:**\n${reason}`);
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

        const message = await this.log(interaction.guild as Guild, {
            ...(guildSettings?.moderatorRoleId
                ? { content: `<@&${guildSettings.moderatorRoleId}>` }
                : {}),
            embeds: [banEmbed],
            components: [row],
        });

        await this.db.banRequest.create({
            data: {
                guildId: (interaction.guild as Guild).id,
                messageId: (message as Message).id,
                reason,
                daysToDelete: days,
                User: {
                    connectOrCreate: {
                        create: {
                            id: member.id,
                        },
                        where: {
                            id: member.id,
                        },
                    },
                },
                Moderator: {
                    connectOrCreate: {
                        create: {
                            id: (interaction.member as GuildMember).id,
                        },
                        where: {
                            id: (interaction.member as GuildMember).id,
                        },
                    },
                },
            },
        });

        await interaction.reply(
            `I've created a ban request for ${member.toString()} (see it here: https://discord.com/channels/${
                interaction.guildId
            }/${guildSettings.logChannelId}/${(message as Message).id})`
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
