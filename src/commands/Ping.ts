import { CommandInteraction } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
}
