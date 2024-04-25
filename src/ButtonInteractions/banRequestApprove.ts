import type { BanRequest, GuildSettings } from '@prisma/client';
import type {
    ButtonInteraction,
    EmbedField,
    Guild,
    GuildMember,
    Message,
} from 'discord.js';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import InteractionHandler from '../base/InteractionHandler.js';

export default class BanRequestApprove extends InteractionHandler {
    async execute(button: ButtonInteraction) {
        // Check if the user is allowed to add to that ban request
        if (
            !(button.memberPermissions as Readonly<PermissionsBitField>).has(
                PermissionsBitField.Flags.ManageMessages
            )
        )
            return button.deferUpdate();

        const banRequest = await this.db.banRequest.findFirst({
            where: {
                AND: {
                    guildId: (button.guild as Guild).id,
                    messageId: button.message.id,
                    isRejected: false,
                },
            },
        });
        if (!banRequest) return button.deferUpdate(); // how did this even happen?
        if (banRequest.moderatorId === (button.member as GuildMember).id)
            return button.reply({
                content: 'You cannot approve your own ban request',
                ephemeral: true,
            });
        if (banRequest.approved_by.includes((button.member as GuildMember).id))
            return button.reply({
                content: 'You have already approved this ban request',
                ephemeral: true,
            });

        const approved_by = [
            ...banRequest.approved_by,
            (button.member as GuildMember).id,
        ];

        const guildSettings = await this.getGuildSettings(
            (button.guild as Guild).id
        );
        if (!guildSettings?.banApprovalsNeeded)
            return button.reply({
                content:
                    'There seems to be an issue regarding this guilds settings. Please contact an admin of this server.',
                ephemeral: true,
            });

        const updatedBanRequest = await this.db.banRequest.update({
            where: {
                id: banRequest.id,
            },
            data: {
                ...banRequest,
                approved_by,
            },
        });
        return await this.updateButton(
            updatedBanRequest,
            button,
            guildSettings
        );
    }
    async updateButton(
        updatedBanRequest: BanRequest,
        button: ButtonInteraction,
        guildSettings: GuildSettings
    ) {
        const receivedEmbed = button.message.embeds[0];
        const approvedByField = (receivedEmbed.fields as EmbedField[]).find(
            field => field.name.startsWith('Approved By')
        ) || {
            name: `Approved By (${updatedBanRequest.approved_by.length}/${guildSettings.banApprovalsNeeded})`,
            value: '',
            inline: true,
        };

        approvedByField.value = updatedBanRequest.approved_by
            .map(moderator => `<@${moderator}>`)
            .join(', ');
        approvedByField.name = `Approved By (${updatedBanRequest.approved_by.length}/${guildSettings.banApprovalsNeeded})`;

        const updatedEmbed = new EmbedBuilder(receivedEmbed.data).setFields([
            ...(receivedEmbed.fields as EmbedField[]).filter(
                field => !field.name.startsWith('Approved By')
            ),
            approvedByField,
        ]);
        await (button.message as Message).edit({ embeds: [updatedEmbed] });
        button.reply({
            content: `You have approved this ban request. ${
                guildSettings.banApprovalsNeeded -
                    updatedBanRequest.approved_by.length !==
                0
                    ? `${
                          guildSettings.banApprovalsNeeded -
                          updatedBanRequest.approved_by.length
                      } more approvals are needed.`
                    : 'The user will be banned shortly.'
            }`,
            ephemeral: true,
        });
        if (
            updatedBanRequest.approved_by.length >=
            guildSettings.banApprovalsNeeded
        ) {
            this.banUser(button, updatedBanRequest);
        }
    }
    async banUser(button: ButtonInteraction, banRequest: BanRequest) {
        const {
            guildId,
            userId,
            moderatorId,
            reason,
            daysToDelete: days,
        } = banRequest;

        const updatedMessage = await (button.message as Message).fetch();
        const embed = new EmbedBuilder(updatedMessage.embeds[0].data).setTitle(
            '[BANNED] Ban request'
        );

        (button.guild as Guild).bans
            .create(userId, {
                reason: reason ?? '',
                deleteMessageDays: days ?? 0,
            })
            .then(() =>
                new this.Sanction(
                    userId,
                    moderatorId,
                    guildId,
                    'BAN',
                    reason ?? ''
                )
                    .create()
                    .then(() =>
                        updatedMessage
                            .edit({ embeds: [embed], components: [] })
                            .then(() =>
                                this.db.banRequest.update({
                                    where: { id: banRequest.id },
                                    data: { isRejected: true },
                                })
                            )
                    )
            );
    }
}
