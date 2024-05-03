import type { ChatInputCommandInteraction } from 'discord.js';
import {
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    inlineCode,
} from 'discord.js';
import { client } from 'index.js';
import type { Config } from '../base/Command.js';
import Command from '../base/Command.js';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Settings command')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('channels')
                    .setDescription('Set channels')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('channel-setting')
                            .setDescription('The channel setting to set')
                            .setRequired(true)
                            .addChoices(
                                {
                                    name: 'logchannel',
                                    value: 'logChannelId',
                                },
                                {
                                    name: 'welcomechannel',
                                    value: 'welcomeChannelId',
                                }
                            )
                    )
                    .addChannelOption(channelOption =>
                        channelOption
                            .setName('channel')
                            .setDescription('The channel to set')
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('roles')
                    .setDescription('Set roles')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('role-setting')
                            .setDescription('The role setting to set')
                            .setRequired(true)
                            .addChoices(
                                { name: 'muterole', value: 'muteRoleId' },
                                {
                                    name: 'moderatorrole',
                                    value: 'moderatorRoleId',
                                } // TODO: allow for more than one role
                            )
                    )
                    .addRoleOption(roleOption =>
                        roleOption
                            .setName('role')
                            .setDescription('The role to set')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('ban-approvals')
                    .setDescription(
                        'Set the numbers of ban approvals needed to ban the user.'
                    )
                    .addNumberOption(numberOption =>
                        numberOption
                            .setName('ban-approvals-setting')
                            .setDescription('The ban approvals setting to set')
                            .setRequired(true)
                            .addChoices(
                                { name: '1', value: 1 },
                                { name: '2', value: 2 },
                                { name: '3', value: 3 },
                                { name: '4', value: 4 }
                            )
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('welcome-message')
                    .setDescription('Set welcome message')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('welcome-message-setting')
                            .setDescription(
                                'The welcome message template ({{username}}, and {{servername}} is supported)'
                            )
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('enabled-commands')
                    .setDescription('Toggle active state of commands')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('command-name')
                            .setDescription(
                                'The command name to toggle on/off.'
                            )
                            .setRequired(true)
                            .setChoices(
                                ...client.commands.map(command => ({
                                    name: command.name,
                                    value: command.name,
                                }))
                            )
                    )
                    .addBooleanOption(booleanOption =>
                        booleanOption
                            .setName('enabled')
                            .setDescription('Set the status')
                            .setRequired(true)
                    )
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand(true)) {
            case 'channels':
                this.setChannel(interaction);
                break;
            case 'roles':
                this.setRole(interaction);
                break;
            case 'ban-approvals':
                this.setBanApprovals(interaction);
                break;
            case 'welcome-message':
                this.setWelcomeMessage(interaction);
                break;
            case 'enabled-commands':
                this.setEnabledCommand(interaction);
                break;
            default:
                break;
        }
    }

    private async setSetting(
        guildId: string,
        setting: string,
        value: string | string[] | number
    ) {
        await this.db.guildSettings.upsert({
            where: {
                id: guildId,
            },
            create: {
                id: guildId,
                [setting]: value,
            },
            update: {
                [setting]: value,
            },
        });
    }

    private async setBanApprovals(interaction: ChatInputCommandInteraction) {
        const approvalsNeeded = interaction.options.getNumber(
            'ban-approvals-setting'
        );
        await this.setSetting(
            interaction.guildId as string,
            'banApprovalsNeeded',
            approvalsNeeded ?? 1
        );
        interaction.reply(`banApprovalsNeeded set to ${approvalsNeeded}`);
    }

    private async setChannel(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;
        const setting = interaction.options.getString('channel-setting', true);
        const channel = interaction.options.getChannel('channel', true);

        await this.setSetting(interaction.guildId, setting, channel.id);

        interaction.reply(`${setting} set to ${channel}`);
    }

    private async setRole(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;
        const setting = interaction.options.getString('role-setting', true);
        const role = interaction.options.getRole('role', true);

        await this.setSetting(interaction.guildId, setting, role.id);

        interaction.reply(`${setting} set to ${role}`);
    }

    private async setWelcomeMessage(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;
        const welcomeMessage = interaction.options.getString(
            'welcome-message-setting',
            true
        );
        await this.setSetting(
            interaction.guildId,
            'welcomeMessage',
            welcomeMessage
        );
        interaction.reply(`welcomeMessage set to ${welcomeMessage}`);
    }

    private async setEnabledCommand(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;
        const commandName = interaction.options.getString('command-name', true);
        const isEnabled = interaction.options.getBoolean('enabled', true);
        const guildSettings = await this.getGuildSettings(interaction.guildId);
        if (!guildSettings) return;
        const disabledCommands = new Set(guildSettings.disabledCommands);

        if (isEnabled) disabledCommands.delete(commandName);
        else disabledCommands.add(commandName);
        await this.setSetting(interaction.guildId, 'disabledCommands', [
            ...disabledCommands,
        ]);

        interaction.reply(
            `disabledCommands set to ${inlineCode([...disabledCommands].join(', '))}`
        );
    }
}
