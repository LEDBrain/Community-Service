import type { CommandInteraction, GuildMember } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Mute extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mute command')
            .addUserOption(userOption =>
                userOption
                    .setName('user')
                    .setDescription('The user to mute')
                    .setRequired(true)
            )
            .addStringOption(stringOption =>
                stringOption
                    .setName('reason')
                    .setDescription('The reason for the mute')
                    .setRequired(false)
            );

        super(cmd as unknown as Config);
    }
    public async execute(interaction: CommandInteraction) {
        if (!this.isEnabled(interaction.guild.id)) return;
        const member = interaction.options.getMember(
            'user',
            true
        ) as GuildMember;
        const reason = interaction.options.getString('reason', false);

        const { muteRoleId } = await this.db.guildSettings.findUnique({
            where: {
                id: interaction.guild.id,
            },
            select: {
                muteRoleId: true,
            },
        });
        if (!muteRoleId.length)
            return interaction.reply({
                content: 'No mute role set',
                ephemeral: true,
            });
        const role = interaction.guild.roles.cache.get(muteRoleId);
        if (role.permissions.has('SEND_MESSAGES'))
            role.permissions.remove('SEND_MESSAGES');
        member.roles.add(role, reason);
    }
}
