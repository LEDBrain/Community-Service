import InteractionHandler from '../base/InteractionHandler';
import type { ChannelType, SelectMenuInteraction } from 'discord.js';
import {
    PermissionFlagsBits,
    ButtonBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    messageLink,
} from 'discord.js';

export default class ReactionRoleSelect extends InteractionHandler {
    async execute(selectMenu: SelectMenuInteraction) {
        // Never
        if (
            !selectMenu.memberPermissions?.has(
                PermissionFlagsBits.ManageMessages
            )
        )
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
        const embed = new EmbedBuilder()
            .setTitle(`Reaction Role: ${reactionRole.name}`)
            .setDescription(
                `Use the buttons below to edit the reaction role message and emojis\n[Link](${messageLink(
                    reactionRole.channelId,
                    reactionRole.messageId,
                    reactionRole.guildId
                )})`
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${reactionRole.id}` });
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('reactionRoleDataAdd')
                .setEmoji('➕')
                .setLabel('Add Emoji')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('reactionRoleDataEdit')
                .setEmoji('📝')
                .setLabel('Edit Emojis/Roles')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('reactionRoleDataDelete')
                .setEmoji('🗑')
                .setLabel('Delete Emojis/Roles')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('reactionRoleDelete')
                .setEmoji('🗑️')
                .setLabel('Delete Reaction Role Message')
                .setStyle(ButtonStyle.Danger)
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
