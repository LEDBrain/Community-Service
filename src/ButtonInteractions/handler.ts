import type { ButtonInteraction } from 'discord.js';
import fs from 'node:fs/promises';
import type InteractionHandler from '../base/InteractionHandler.js';

export default async (button: ButtonInteraction) => {
    const buttonFiles = (await fs.readdir('./'))
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
            await import(`./${button.customId}.js`)
        ).default() as InteractionHandler
    ).execute(button);
};
