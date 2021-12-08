// This file is optional since this uses
// /-Commands

import Event from '../base/Event';
import { Message } from 'discord.js';
import Client from '../base/Client';
export default class MessageCreate extends Event {
    constructor() {
        super({ name: 'messageCreate' });
    }
    public async execute(_: Client, message: Message) {
        if (
            message.content.toLowerCase() === 'deploy' &&
            message.author.id === '199964094357307392' // Change this to the bot admin/dev id
        ) {
            console.log(`Deploying...`);
            (await import('../deploy')).default();
        }
    }
}
