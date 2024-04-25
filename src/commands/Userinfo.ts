import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import type { Config } from '../base/Command.js';
import Command from '../base/Command.js';

export default class Userinfo extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Get information about a user')
            .addUserOption(userOption =>
                userOption
                    .setName('user')
                    .setDescription('The user to get the information about')
                    .setRequired(false)
            );
        super(cmd as unknown as Config);
    }

    public async execute(interaction: ChatInputCommandInteraction) {
        const member =
            interaction.options.getMember('user') ?? interaction.member;
        interaction.reply((member as GuildMember).toString());
    }
}
