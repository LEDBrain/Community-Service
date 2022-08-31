import type {
    ButtonInteraction,
    ModalActionRowComponentBuilder,
    TextBasedChannel,
} from 'discord.js';
import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import ms from 'ms';
import ReactionRole from '../base/ReactionRole';

export default class ReactionDataAdd extends ReactionRole {
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        await this.getReactionRole(button);
        if (!this.reactionRole) return;
        const oldMessage = await (
            (await button.guild?.channels.fetch(
                this.reactionRole.channelId
            )) as TextBasedChannel
        )?.messages.fetch(this.reactionRole.messageId);
        const modal = new ModalBuilder()
            .setCustomId('contentModal')
            .setTitle('Edit the embed message content');
        const modalTitleField = new TextInputBuilder()
            .setCustomId('titleField')
            .setLabel('Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(oldMessage?.embeds[0]?.title || 'Reaction Role')
            .setValue(oldMessage?.embeds[0]?.title || 'Reaction Role')
            .setMaxLength(256);
        const modalContentField = new TextInputBuilder()
            .setCustomId('contentField')
            .setLabel('Content')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder(
                oldMessage.embeds[0]?.description ||
                    'React to an emoji to get a role!'
            )
            .setValue(
                oldMessage.embeds[0]?.description ||
                    'React to an emoji to get a role!'
            )
            .setMaxLength(4000);

        const firstRow =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                modalTitleField
            );
        const secondRow =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                modalContentField
            );

        modal.addComponents(firstRow, secondRow);

        await button.showModal(modal);
        const submittedModal = await button.awaitModalSubmit({
            filter: i => i.customId === 'contentModal',
            time: ms('20min'),
        });
        const newEmbed = new EmbedBuilder(oldMessage.embeds[0].data)
            .setTitle(submittedModal.fields.getTextInputValue('titleField'))
            .setDescription(
                submittedModal.fields.getTextInputValue('contentField')
            );
        await oldMessage.edit({ embeds: [newEmbed] });
        button.reply({ content: 'Embed updated!', ephemeral: true });
    }
}
