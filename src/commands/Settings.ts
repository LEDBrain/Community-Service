import { CommandInteraction } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

const settings = [['logchannel', 'logchannel']] as [
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
        const setting = interaction.options.getString('channel-setting');
        const channel = interaction.options.getChannel('channel', true);

        interaction.reply(`...`);
    }
}
