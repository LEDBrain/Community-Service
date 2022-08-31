import type { ReactionRoleMessage } from '@prisma/client';
import type { ButtonInteraction, EmbedFooterOptions } from 'discord.js';
import InteractionHandler from './InteractionHandler';

export default abstract class ReactionRole extends InteractionHandler {
    reactionRole!: ReactionRoleMessage | null;
    id!: number;
    constructor() {
        super();
    }

    // abstract execute(button: ButtonInteraction): Promise<unknown> | unknown;
    async getReactionRole(
        button: ButtonInteraction
    ): Promise<ReactionRoleMessage | null> {
        this.id = parseInt(
            (
                button.message.embeds[0].data.footer as EmbedFooterOptions
            ).text.replace('ID: ', '')
        );
        this.reactionRole = await this.db.reactionRoleMessage.findUnique({
            where: {
                id: this.id,
            },
        });
        // TODO: Do error handling
        if (!this.reactionRole) {
            await button.deferUpdate();
            return null;
        }
        return this.reactionRole;
    }
}
