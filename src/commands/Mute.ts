import type { CommandInteraction, Guild, GuildMember, Role } from 'discord.js';
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
        const member = interaction.options.getMember(
            'user',
            true
        ) as GuildMember;
        const reason = interaction.options.getString('reason', false);

        const guildSettings = await this.db.guildSettings.findUnique({
            where: {
                id: (interaction.guild as Guild).id,
            },
            select: {
                muteRoleId: true,
            },
        });
        if (!guildSettings?.muteRoleId.length)
            return interaction.reply({
                content: 'No mute role set',
                ephemeral: true,
            });
        const role = (interaction.guild as Guild).roles.cache.get(
            guildSettings.muteRoleId
        );
        if ((role as Role).permissions.has('SEND_MESSAGES'))
            (role as Role).permissions.remove('SEND_MESSAGES');
        member.roles.add(role as Role, reason ?? '').then(gm => {
            new this.Sanction(
                gm.id,
                (interaction.member as GuildMember).user.id,
                (interaction.guild as Guild).id,
                'MUTE',
                reason ?? 'No reason provided'
            ).create();
            interaction.reply(
                `Muted ${gm.toString()} by ${(
                    interaction.member as GuildMember
                ).toString()} for ${reason}`
            );
        });
    }
}
