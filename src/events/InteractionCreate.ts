import type { Interaction } from 'discord.js';
import Event from '../base/Event';
import type Client from '../base/Client';

export default class InteractionCreate extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }
    public async execute(
        client: Client,
        interaction: Interaction
    ): Promise<void> {
        if (!interaction.isCommand()) return;
        if (!client.commands.has(interaction.commandName)) return;
        try {
            await client.commands
                .get(interaction.commandName)
                .execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) return;
            await interaction.reply({
                content: 'Es gab einen Fehler beim Ausführen des Commands!',
                ephemeral: true,
            });
        }
    }
}
