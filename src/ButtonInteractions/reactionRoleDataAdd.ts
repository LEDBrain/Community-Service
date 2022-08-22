import InteractionHandler from '../base/InteractionHandler';
import { MessageCollector } from 'discord.js';
import type {
    ButtonInteraction,
    Message,
    GuildMember,
    TextBasedChannel,
    EmbedFooterOptions,
} from 'discord.js';
import ms from 'ms';

export default class ReactionDataAdd extends InteractionHandler {
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        const id = parseInt(
            (
                button.message.embeds[0].data.footer as EmbedFooterOptions
            ).text.replace('ID: ', '')
        );
        const reactionRole = await this.db.reactionRoleMessage.findUnique({
            where: {
                id,
            },
        });
        if (!reactionRole) return button.deferUpdate();
        const message = (await button.reply({
            content: 'Send the emoji as a message',
            fetchReply: true,
        })) as Message;
        const emoji = await this.collectEmoji(
            message.channel,
            button.member as GuildMember
        );
        console.log(emoji);
    }
    async collectEmoji(
        channel: TextBasedChannel,
        member: GuildMember
    ): Promise<Message> {
        return new Promise((res, rej) => {
            const filter = (m: Message) => m.author.id === member.id;
            const messageCollector = new MessageCollector(channel, {
                filter,
                time: ms('5m'),
                max: 1,
            });

            messageCollector.once('end', collected => {
                const message = collected.first();
                if (!message) return rej();
                res(message);
            });
        });
    }
}
