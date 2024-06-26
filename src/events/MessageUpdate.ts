import { EmbedBuilder, messageLink, type Message } from 'discord.js';
import type Client from '../base/Client.js';
import Event from '../base/Event.js';
import { diff, format } from '../utils/Diff.js';

export default class MessageUpdate extends Event {
    constructor() {
        super({ name: 'messageUpdate' });
    }
    public async execute(_: Client, oldMessage: Message, newMessage: Message) {
        if (newMessage.author.bot) return;
        if (newMessage.content === oldMessage.content) return;
        if (oldMessage.partial) await oldMessage.fetch();
        if (newMessage.partial) await newMessage.fetch();

        const messageDiff = diff(oldMessage.content, newMessage.content);

        const formattedDiff = format(messageDiff);

        const embed = new EmbedBuilder()
            .setTitle('A message was edited')
            .addFields([
                {
                    name: ' ',
                    value: messageLink(newMessage.channelId, newMessage.id),
                },
            ])
            .setDescription(formattedDiff)
            .setColor('Blue')
            .setFooter({
                text: `Community Service ${this.version}`,
            })
            .setTimestamp();

        if (newMessage.inGuild())
            this.log(newMessage.guild, { embeds: [embed] });
    }
}
