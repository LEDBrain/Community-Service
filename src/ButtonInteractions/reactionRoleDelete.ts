import type { ButtonInteraction, Guild, TextChannel } from 'discord.js';
import ReactionRole from '../base/ReactionRole';

export default class reactionRoleDelete extends ReactionRole {
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        await this.getReactionRole(button);
        if (!this.reactionRole) return;
        const rrMessage = await (
            (await (button.guild as Guild).channels.fetch(
                this.reactionRole.channelId
            )) as TextChannel
        ).messages.fetch(this.reactionRole.messageId);
        rrMessage.delete().then(async () => {
            await this.db.reactionRoleMessage.delete({
                where: { id: this.id },
            });
            button.update({
                content: 'Reaction Role Deleted',
                components: [],
                embeds: [],
            });
        });
    }
}
