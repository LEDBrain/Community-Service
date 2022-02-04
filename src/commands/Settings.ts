import { CommandInteraction } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

const settings = [['logchannel', 'logChannelId']] as [
    name: string,
    value: string
][];

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
                            .addChoices(settings)
                    )
                    .addChannelOption(channelOption =>
                        channelOption
                            .setName('channel')
                            .setDescription('The channel to set')
                            .addChannelType(0)
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
}
