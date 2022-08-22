import InteractionHandler from '../base/InteractionHandler';
import { MessageCollector } from 'discord.js';
import type {
    ButtonInteraction,
    Message,
    GuildMember,
    TextBasedChannel,
    EmbedFooterOptions,
    Guild,
} from 'discord.js';
import ms from 'ms';
import type { ReactionRoleMessage } from '@prisma/client';

export default class ReactionDataAdd extends InteractionHandler {
    private reactionRole: ReactionRoleMessage | null | undefined;
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        const id = parseInt(
            (
                button.message.embeds[0].data.footer as EmbedFooterOptions
            ).text.replace('ID: ', '')
        );
        this.reactionRole = await this.db.reactionRoleMessage.findUnique({
            where: {
                id,
            },
        });
        if (!this.reactionRole) return button.deferUpdate();
        const message = (await button.reply({
            content: 'Send the emoji as a message',
            fetchReply: true,
        })) as Message;
        const { content: emoji } = await this.collectEmoji(
            message.channel,
            button.member as GuildMember
        );
        const isValid = await this.validateEmoji(message.guild as Guild, emoji);
        if (!isValid) return;
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
    async validateEmoji(guild: Guild, emoji: string): Promise<boolean> {
        const message = await (
            (await guild.channels.fetch(
                this.reactionRole?.channelId as string
            )) as TextBasedChannel
        ).messages.fetch(this.reactionRole?.messageId as string);
        return new Promise((res, rej) => {
            message
                .react(emoji)
                .then(() => res(true))
                .catch(() => rej(false));
        });
    }
}
