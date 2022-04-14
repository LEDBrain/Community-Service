import type {
    CommandInteraction,
    MessageSelectOptionData,
    TextChannel,
} from 'discord.js';
import { MessageSelectMenu, MessageActionRow } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Colors } from '../utils';

export default class ReactionRole extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('reaction-role')
            .setDescription('Reaction Role')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('create')
                    .setDescription('Create a reaction role')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('name')
                            .setDescription('Name of the reaction role')
                            .setRequired(true)
                    )
                    .addIntegerOption(integerOption =>
                        integerOption
                            .setName('amount')
                            .setDescription(
                                'Amount of roles one can assign to themselves (0 = infinite; default)'
                            )
                            .setRequired(false)
                            .setMinValue(0)
                            .setMaxValue(25)
                    )
                    .addChannelOption(
                        channelOption =>
                            channelOption
                                .setName('channel')
                                .setDescription(
                                    'The channel to create the reaction role in'
                                )
                                .setRequired(false)
                                .addChannelType(0) // Text channel
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('edit')
                    .setDescription('Add a reaction to a reaction role')
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        if (!interaction.memberPermissions.has('MANAGE_MESSAGES'))
            interaction.reply({
                content: 'You have the permission to manage reaction roles',
                ephemeral: true,
            });

        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === 'create') {
            return await this.createReactionRole(interaction);
        } else if (subcommand === 'edit') {
            return await this.editReactionRole(interaction);
        }
    }

    private async createReactionRole(interaction: CommandInteraction) {
        const name = interaction.options.getString('name');
        const channel =
            (interaction.options.getChannel('channel') as TextChannel) ??
            interaction.channel;

        const embed = new MessageEmbed()
            .setTitle(name)
            .setDescription('Use the Buttons to assign yourself to roles.')
            .setColor(Colors.fromString(name))
            .setTimestamp();
        channel.send({ embeds: [embed] }).then(async msg => {
            await this.db.reactionRoleMessage
                .create({
                    data: {
                        messageId: msg.id,
                        guildId: msg.guildId,
                        assignableRoleAmount:
                            interaction.options.getInteger('amount', false) ??
                            undefined,
                        channelId: msg.channelId,
                        name,
                        roleToEmoji: {},
                    },
                })
                .then(
                    async () =>
                        await interaction.reply({
                            content:
                                'Message created! You can now go ahead and add buttons to the message by using the `/reactionrole edit`-Command',
                            ephemeral: true,
                        })
                );
        });
        return;
    }
    private async editReactionRole(interaction: CommandInteraction) {
        const reactionRoles = await this.db.reactionRoleMessage.findMany({
            where: {
                guildId: interaction.guildId,
            },
        });
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('reactionRoleSelect')
                .setPlaceholder('Choose a reaction role message')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    ...reactionRoles.map(
                        rr =>
                            ({
                                label: rr.name,
                                value: rr.id.toString(),
                            } as MessageSelectOptionData)
                    )
                )
        );
        return await interaction.reply({
            content: 'Choose a reaction role message',
            components: [row],
            ephemeral: true,
        });
    }
}
