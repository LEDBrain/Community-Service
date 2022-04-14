import InteractionHandler from '../base/InteractionHandler';
import type { ButtonInteraction, TextChannel } from 'discord.js';

export default class reactionRoleDelete extends InteractionHandler {
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        const id = parseInt(
            button.message.embeds[0].footer.text.replace('ID: ', '')
        );
        const reactionRole = await this.db.reactionRoleMessage.findUnique({
            where: {
                id,
            },
        });
        if (!reactionRole) return button.deferUpdate();
        const rrMessage = await (
            (await button.guild.channels.fetch(
                reactionRole.channelId
            )) as TextChannel
        ).messages.fetch(reactionRole.messageId);
        rrMessage.delete().then(async () => {
            await this.db.reactionRoleMessage.delete({ where: { id } });
            button.update({
                content: 'Reaction Role Deleted',
                components: [],
                embeds: [],
            });
        });
    }
}
