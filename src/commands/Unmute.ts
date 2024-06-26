import type {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    Role,
} from 'discord.js';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Config } from '../base/Command.js';
import Command from '../base/Command.js';

export default class Unmute extends Command {
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('unmute command')
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
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
    public async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.getMember('user') as GuildMember;
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
        if (member.roles.cache.has((role as Role).id))
            member.roles.remove(role as Role).then(async () => {
                const sanction = new this.Sanction(
                    member.id,
                    (interaction.member as GuildMember).user.id,
                    (interaction.guild as Guild).id,
                    'UNMUTE',
                    reason ?? 'No reason provided'
                );
                await sanction.create();
                sanction.link('MUTE', sanction);
                interaction.reply(
                    `Unmuted ${member.toString()} by ${(
                        interaction.member as GuildMember
                    ).toString()} for ${reason}`
                );
            });
    }
}
