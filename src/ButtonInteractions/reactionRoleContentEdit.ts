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
            .setMaxLength(4096);

        const row =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                modalContentField
            );

        modal.addComponents(row);

        await button.showModal(modal);
        const submittedModal = await button.awaitModalSubmit({
            filter: i => i.customId === 'contentModal',
            time: ms('20min'),
        });
        const newEmbed = new EmbedBuilder(
            oldMessage.embeds[0].data
        ).setDescription(
            submittedModal.fields.getTextInputValue('contentField')
        );
        await oldMessage.edit({ embeds: [newEmbed] });
    }
}
