import type { CommandInteraction } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Ping extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping command');

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        if (!this.isEnabled(interaction.guild.id)) return;
        await interaction.reply('Pong!');
    }
}
