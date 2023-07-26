import fs from 'fs/promises';
import type { ButtonInteraction } from 'discord.js';
import type InteractionHandler from '../base/InteractionHandler';

export default async (button: ButtonInteraction) => {
    const buttonFiles = (await fs.readdir(__dirname))
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .filter(file => file !== 'handler.ts');
    if (
        !buttonFiles.some(file =>
            file.match(new RegExp(`${button.customId}.(ts|js)`))
        )
    ) {
        console.log(
            'No handler found for button. Button ID: ' + button.customId
        );

        return;
    }
    (
        new (
            await import(`${__dirname}/${button.customId}`)
        ).default() as InteractionHandler
    ).execute(button);
};
