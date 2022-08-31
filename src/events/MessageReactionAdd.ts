import type { MessageReaction, User } from 'discord.js';
import type Client from '../base/Client';
import Event from '../base/Event';

export default class MessageReactionAdd extends Event {
    constructor() {
        super({ name: 'messageReactionAdd' });
    }
    public async execute(
        _: Client,
        messageReaction: MessageReaction,
        user: User
    ): Promise<void> {
        const message = await messageReaction.message.fetch();
        try {
            const rrMessage =
                await this.db.reactionRoleMessage.findFirstOrThrow({
                    where: {
                        messageId: message.id,
                    },
                    include: {
                        roleToEmoji: true,
                    },
                });
            if (!rrMessage) throw new Error('No reaction role message found');
            const reactionEmoji = messageReaction.emoji.identifier;
            const role = rrMessage.roleToEmoji.find(
                r => r.emojiId === reactionEmoji
            );
            if (!role) throw new Error('No role found for the emoji');

            message.guild?.members.fetch(user.id).then(member => {
                member.roles.add(role.roleId);
            });
        } catch (error) {
            return;
        }
    }
}
