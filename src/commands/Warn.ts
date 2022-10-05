import { SlashCommandBuilder } from 'discord.js';
import type {
    Guild,
    GuildMember,
    ChatInputCommandInteraction,
} from 'discord.js';
import type { Config } from '../base/Command';
import Command from '../base/Command';

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
    public async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.getMember('user') as GuildMember;
        const reason = interaction.options.getString('reason', true);
        new this.Sanction(
            member.id,
            (interaction.member as GuildMember).user.id,
            (interaction.guild as Guild).id,
            'WARN',
            reason
        ).create();
        interaction.reply(`Warned user ${member.user.tag} (${member.id})`);
    }
}
