import Event from '../base/Event';
import { EmbedBuilder, messageLink, type Message } from 'discord.js';
import type Client from '../base/Client';
import { diff, format } from '../utils/Diff';

export default class MessageUpdate extends Event {
    constructor() {
        super({ name: 'messageUpdate' });
    }
    public async execute(_: Client, oldMessage: Message, newMessage: Message) {
        if (newMessage.author.bot) return;
        if (oldMessage.partial) await oldMessage.fetch();
        if (newMessage.partial) await newMessage.fetch();

        const { version } = await import('../../package.json');

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
                text: `Community Service v${version}`,
            })
            .setTimestamp();
        if (newMessage.inGuild())
            this.log(newMessage.guild, { embeds: [embed] });
    }
}
