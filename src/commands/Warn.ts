import { CommandInteraction, GuildMember } from 'discord.js';
import Command, { Config } from '../base/Command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class Ban extends Command {
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
        //interaction.deferReply();
        const member = interaction.options.getMember(
            'user',
            true
        ) as GuildMember;
        const reason = interaction.options.getString('reason', true);

        await this.db.sanction.create({
            data: {
                type: 'WARN',
                reason,
                Moderator: {
                    connectOrCreate: {
                        create: {
                            id: interaction.member.user.id,
                        },
                        where: {
                            id: interaction.member.user.id,
                        },
                    },
                },
                User: {
                    connectOrCreate: {
                        create: {
                            id: member.id,
                        },
                        where: {
                            id: member.id,
                        },
                    },
                },
            },
        });
        interaction.reply(`Warned user ${member.user.tag} (${member.id})`);
    }
}
