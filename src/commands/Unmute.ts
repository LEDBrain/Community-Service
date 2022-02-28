import type { CommandInteraction, GuildMember } from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Unmute extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('unmute command')
            .addUserOption(userOption =>
                userOption
                    .setName('user')
                    .setDescription('The user to unmute')
                    .setRequired(true)
            )
            .addStringOption(stringOption =>
                stringOption
                    .setName('reason')
                    .setDescription('The reason for the unmute')
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
                id: interaction.guild.id,
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
        const role = interaction.guild.roles.cache.get(
            guildSettings.muteRoleId
        );
        if (member.roles.cache.has(role.id))
            member.roles.remove(role).then(async () => {
                const sanction = new this.Sanction(
                    member.id,
                    interaction.member.user.id,
                    interaction.guild.id,
                    'UNMUTE',
                    reason
                );
                await sanction.create();
                sanction.link('MUTE', sanction);
                interaction.reply(
                    `Unmuted ${member.toString()} by ${interaction.member.toString()} for ${reason}`
                );
            });
    }
}
