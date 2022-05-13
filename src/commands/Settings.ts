import type { CommandInteraction } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('settings')
            .setDescription('Settings command')
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
                            .addChannelTypes(0)
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
                    .setDescription('Set ban approvals')
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
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
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
            default:
                break;
        }
    }

    private async setSetting(
        guildId: string,
        setting: string,
        value: string | number
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

    private async setBanApprovals(interaction: CommandInteraction) {
        const approvalsNeeded = interaction.options.getNumber(
            'ban-approvals-setting'
        );
        await this.setSetting(
            interaction.guildId,
            'banApprovalsNeeded',
            approvalsNeeded
        );
        interaction.reply(`banApprovalsNeeded set to ${approvalsNeeded}`);
    }

    private async setChannel(interaction: CommandInteraction) {
        const setting = interaction.options.getString('channel-setting');
        const channel = interaction.options.getChannel('channel', true);

        await this.setSetting(interaction.guildId, setting, channel.id);

        interaction.reply(`${setting} set to ${channel}`);
    }

    private async setRole(interaction: CommandInteraction) {
        const setting = interaction.options.getString('role-setting');
        const role = interaction.options.getRole('role', true);

        await this.setSetting(interaction.guildId, setting, role.id);

        interaction.reply(`${setting} set to ${role}`);
    }
}
