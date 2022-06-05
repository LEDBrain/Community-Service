import InteractionHandler from '../base/InteractionHandler';
import type { SelectMenuInteraction } from 'discord.js';
import { MessageButton, MessageEmbed, MessageActionRow } from 'discord.js';

export default class ReactionRoleSelect extends InteractionHandler {
    async execute(selectMenu: SelectMenuInteraction) {
        // Never
        if (!selectMenu.memberPermissions?.has('MANAGE_MESSAGES'))
            return selectMenu.deferUpdate();
        const reactionRoleId = selectMenu.values[0];
        const reactionRole = await this.db.reactionRoleMessage.findUnique({
            where: {
                id: parseInt(reactionRoleId),
            },
            include: {
                roleToEmoji: true,
            },
        });
        if (!reactionRole) return selectMenu.deferUpdate(); // TODO: Handle no reactionRole found
        const embed = new MessageEmbed()
            .setTitle(`Reaction Role: ${reactionRole.name}`)
            .setDescription(
                'Use the buttons below to edit the reaction role message and emojis'
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${reactionRole.id}` });
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('reactionRoleDataAdd')
                .setEmoji('➕')
                .setLabel('Add Emoji')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('reactionRoleDataEdit')
                .setEmoji('📝')
                .setLabel('Edit Emojis/Roles')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('reactionRoleDataDelete')
                .setEmoji('🗑')
                .setLabel('Delete Emojis/Roles')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('reactionRoleDelete')
                .setEmoji('🗑️')
                .setLabel('Delete Reaction Role Message')
                .setStyle('DANGER')
        );
        await selectMenu.update({
            components: [],
            content: `Chose Reaction Role: ${reactionRole.name}`,
        });
        await selectMenu.followUp({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });
    }
}
