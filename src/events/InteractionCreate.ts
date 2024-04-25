import type { CommandInteraction, Guild, Interaction } from 'discord.js';
import buttonHandler from '../ButtonInteractions/handler.js';
import type Client from '../base/Client.js';
import type Command from '../base/Command.js';
import Event from '../base/Event.js';
import { prisma } from '../base/Prisma.js';

export default class InteractionCreate extends Event {
    constructor() {
        super({ name: 'interactionCreate' });
    }

    private async isEnabled(interaction: CommandInteraction): Promise<boolean> {
        const guildSettings = await prisma.guildSettings.findFirst({
            where: {
                id: (interaction.guild as Guild).id,
            },
        });

        return !guildSettings?.disabledCommands.includes(
            interaction.commandName
        );
    }
    public async execute(
        client: Client,
        interaction: Interaction
    ): Promise<void> {
        if (interaction.isButton()) return buttonHandler(interaction);

        if (!interaction.isCommand()) return;
        if (!client.commands.has(interaction.commandName)) return;
        if (!(await this.isEnabled(interaction))) {
            interaction.reply({
                content: 'This command is disabled',
                ephemeral: true,
            });
            return;
        }
        try {
            await (
                client.commands.get(interaction.commandName) as Command
            ).execute(interaction);
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
