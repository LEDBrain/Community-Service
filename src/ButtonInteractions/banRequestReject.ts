import InteractionHandler from '../base/InteractionHandler';
import type {
    ButtonInteraction,
    Guild,
    GuildMember,
    Message,
    Permissions,
} from 'discord.js';
import { MessageEmbed } from 'discord.js';

export default class BanRequestReject extends InteractionHandler {
    constructor() {
        super();
    }
    public async execute(button: ButtonInteraction) {
        if (
            !(button.memberPermissions as Readonly<Permissions>).has(
                'MANAGE_MESSAGES'
            )
        )
            return button.deferUpdate();
        const banRequest = await this.db.banRequest.findFirst({
            where: {
                AND: {
                    guildId: (button.guild as Guild).id,
                    messageId: button.message.id,
                    isRejected: false,
                },
            },
        });
        if (!banRequest) return button.deferUpdate(); // how did this even happen?
        await this.db.banRequest.update({
            where: {
                id: banRequest.id,
            },
            data: {
                ...banRequest,
                isRejected: true,
            },
        });
        const embed = new MessageEmbed(button.message.embeds[0])
            .setTitle('[REJECTED] Ban request')
            .addField('Rejected by', (button.member as GuildMember).toString());
        (button.message as Message).edit({
            embeds: [embed],
            components: [],
        });
        return button.reply({
            content: 'You rejected the ban request',
            ephemeral: true,
        });
    }
}
