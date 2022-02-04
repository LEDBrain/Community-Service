import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Colors, Date as DateUtils } from '../utils';

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

    public async execute(interaction: CommandInteraction) {
        const member =
            interaction.options.getMember('user', false) ?? interaction.member;
        interaction.reply(member.toString());
    }
}
