import ReactionRole from '../base/ReactionRole';
import {
    ActionRowBuilder,
    MessageCollector,
    MessageMentions,
    RoleSelectMenuBuilder,
} from 'discord.js';
import type {
    ButtonInteraction,
    Message,
    GuildMember,
    TextBasedChannel,
    Guild,
    MessageReaction,
    ComponentType,
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

        const roleSelectMenu = new RoleSelectMenuBuilder()
            .setCustomId('roleSelectMenu')
            .setPlaceholder('Select a role')
            .setMinValues(1)
            .setMaxValues(1);
        const roleActionRow =
            new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                roleSelectMenu
            );

        const roleMessage = await button.followUp({
            content: 'Select the role to assing to the emoji',
            components: [roleActionRow],
            ephemeral: true,
        });

        const submittedRole =
            await roleMessage.awaitMessageComponent<ComponentType.RoleSelect>({
                filter: i =>
                    i.isRoleSelectMenu() && i.customId === 'roleSelectMenu',
                time: ms('5m'),
                dispose: true,
            });
        const roleId = submittedRole.values[0];

        await this.db.roleToEmoji.create({
            data: {
                emojiId: isValidEmoji,
                roleId,
                ReactionRoleMessage: {
                    connect: {
                        id: this.reactionRole.id,
                    },
                },
            },
        });

        try {
            submittedRole.deferUpdate();
            await emojiMessage.delete();
            await collectedEmojiMessage.delete();
            await roleMessage.delete();
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
        // TODO: validate if bot can assign role
    }
}
