import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    }
}
