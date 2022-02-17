import type { CommandInteraction, GuildMember } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Warn extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('warn')
            .setDescription('warn command')
            .addUserOption(userOption =>
                userOption
                    .setName('user')
                    .setDescription('The user to warn')
                    .setRequired(true)
            )
            .addStringOption(stringOption =>
                stringOption
                    .setName('reason')
                    .setDescription('The reason for the warning')
                    .setRequired(true)
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        const member = interaction.options.getMember(
            'user',
            true
        ) as GuildMember;
        const reason = interaction.options.getString('reason', true);
        new this.Sanction(
            member.id,
            interaction.member.user.id,
            interaction.guild.id,
            'WARN',
            reason
        ).create();
        interaction.reply(`Warned user ${member.user.tag} (${member.id})`);
    }
}
