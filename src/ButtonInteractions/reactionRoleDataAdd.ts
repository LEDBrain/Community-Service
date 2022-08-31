import ReactionRole from '../base/ReactionRole';
import { MessageCollector, MessageMentions } from 'discord.js';
import type {
    ButtonInteraction,
    Message,
    GuildMember,
    TextBasedChannel,
    Guild,
    Role,
    MessageReaction,
} from 'discord.js';
import ms from 'ms';

export default class ReactionDataAdd extends ReactionRole {
    constructor() {
        super();
    }
    async execute(button: ButtonInteraction) {
        await this.getReactionRole(button);
        if (!this.reactionRole) return;
        const emojiMessage = (await button.reply({
            content: 'Send the emoji as a message',
            fetchReply: true,
        })) as Message;
        const collectedEmojiMessage = await this.collectMessage(
            emojiMessage.channel,
            button.member as GuildMember
        );
        const isValidEmoji = await this.validateEmoji(
            emojiMessage.guild as Guild,
            collectedEmojiMessage.content
        );
        if (!isValidEmoji) return; // TODO: Do error handling

        const roleMessage = (await button.followUp({
            content: 'Tag the role to assing to the emoji',
            fetchReply: true,
        })) as Message;
        const collectedRoleMessage = await this.collectMessage(
            roleMessage.channel,
            button.member as GuildMember
        );

        const role =
            collectedRoleMessage.mentions.roles.size > 0
                ? collectedRoleMessage.mentions
                : collectedRoleMessage.cleanContent;
        const isValidRole = this.validateRole(roleMessage.guild as Guild, role);
        if (!isValidRole) return; // TODO: Do error handling
        console.log(isValidRole);

        await this.db.roleToEmoji.create({
            data: {
                emojiId: isValidEmoji,
                roleId:
                    role instanceof MessageMentions
                        ? (role.roles.first() as Role).id
                        : role,
                ReactionRoleMessage: {
                    connect: {
                        id: this.reactionRole.id,
                    },
                },
            },
        });

        try {
            await emojiMessage.delete();
            await collectedEmojiMessage.delete();
            await roleMessage.delete();
            await collectedRoleMessage.delete();
            // eslint-disable-next-line no-empty
        } catch (err) {}

        button.followUp({
            content: 'Added!',
            ephemeral: true,
        });
    }
    async collectMessage(
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
    async validateEmoji(guild: Guild, emoji: string): Promise<string> {
        const message = await (
            (await guild.channels.fetch(
                this.reactionRole?.channelId as string
            )) as TextBasedChannel
        ).messages.fetch(this.reactionRole?.messageId as string);
        return new Promise((res, rej) => {
            message
                .react(emoji)
                .then((reaction: MessageReaction) =>
                    res(reaction.emoji.identifier)
                )
                .catch(() => rej(null));
        });
    }
    validateRole(guild: Guild, role: MessageMentions | string): boolean {
        if (role instanceof MessageMentions)
            role = role.roles.first()?.id || '';
        return guild.roles.cache.has(role as string);
    }
}
