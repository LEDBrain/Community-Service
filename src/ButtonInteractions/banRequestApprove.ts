import InteractionHandler from '../base/InteractionHandler';
import type { ButtonInteraction, GuildMember, Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import type { BanRequest, GuildSettings } from '@prisma/client';

export default class BanRequestApprove extends InteractionHandler {
    async execute(button: ButtonInteraction) {
        // Check if the user is allowed to add to that ban request
        if (!button.memberPermissions.has('MANAGE_MESSAGES'))
            return button.deferUpdate();

        const banRequest = await this.db.banRequest.findFirst({
            where: {
                AND: {
                    guildId: button.guild.id,
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

        const guildSettings = await this.getGuildSettings(button.guild.id);
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

        if (
            updatedBanRequest.approved_by.length >=
            guildSettings.banApprovalsNeeded
        )
            return this.banUser(updatedBanRequest);
        else return this.updateButton(updatedBanRequest, button, guildSettings);
    }
    updateButton(
        updatedBanRequest: BanRequest,
        button: ButtonInteraction,
        guildSettings: GuildSettings
    ) {
        button.reply({
            content: `You have approved this ban request. ${
                guildSettings.banApprovalsNeeded -
                updatedBanRequest.approved_by.length
            } more approvals are needed.`,
            ephemeral: true,
        });

        const receivedEmbed = button.message.embeds[0];
        const approvedByField = receivedEmbed.fields.find(field =>
            field.name.startsWith('Approved By')
        ) || {
            name: `Approved By (${updatedBanRequest.approved_by.length}/${guildSettings.banApprovalsNeeded})`,
            value: '',
            inline: true,
        };

        approvedByField.value = updatedBanRequest.approved_by
            .map(moderator => `<@${moderator}>`)
            .join(', ');
        approvedByField.name = `Approved By (${updatedBanRequest.approved_by.length}/${guildSettings.banApprovalsNeeded})`;

        const updatedEmbed = new MessageEmbed(receivedEmbed).setFields([
            ...receivedEmbed.fields.filter(
                field => !field.name.startsWith('Approved By')
            ),
            approvedByField,
        ]);
        return (button.message as Message).edit({ embeds: [updatedEmbed] });
    }
    banUser(updatedBanRequest: BanRequest) {
        console.log('Method not implemented.');
    }
}
