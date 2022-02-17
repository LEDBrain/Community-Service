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
                            .addChoices([['logchannel', 'logChannelId']])
                    )
                    .addChannelOption(channelOption =>
                        channelOption
                            .setName('channel')
                            .setDescription('The channel to set')
                            .addChannelType(0)
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
                            .addChoices([['muterole', 'muteRoleId']])
                    )
                    .addRoleOption(roleOption =>
                        roleOption
                            .setName('role')
                            .setDescription('The role to set')
                            .setRequired(true)
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
            default:
                break;
        }
    }

    private async setChannel(interaction: CommandInteraction) {
        const setting = interaction.options.getString('channel-setting');
        const channel = interaction.options.getChannel('channel', true);

        await this.db.guildSettings.upsert({
            where: {
                id: interaction.guild.id,
            },
            create: {
                id: interaction.guild.id,
                [setting]: channel.id,
            },
            update: {
                [setting]: channel.id,
            },
        });

        interaction.reply(`${setting} set to ${channel}`);
    }

    private async setRole(interaction: CommandInteraction) {
        const setting = interaction.options.getString('role-setting');
        const role = interaction.options.getRole('role', true);

        await this.db.guildSettings.upsert({
            where: {
                id: interaction.guild.id,
            },
            create: {
                id: interaction.guild.id,
                [setting]: role.id,
            },
            update: {
                [setting]: role.id,
            },
        });

        interaction.reply(`${setting} set to ${role}`);
    }
}
