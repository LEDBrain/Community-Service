import fs from 'fs/promises';
import type { StringSelectMenuInteraction } from 'discord.js';
import type InteractionHandler from '../base/InteractionHandler';

export default async (selectMenu: StringSelectMenuInteraction) => {
    const selectMenuFiles = (await fs.readdir(__dirname))
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .filter(file => file !== 'handler.ts');
    if (
        !selectMenuFiles.some(file =>
            file.match(new RegExp(`${selectMenu.customId}.(ts|js)`))
        )
    ) {
        console.log(
            'No handler found for button. Button ID: ' + selectMenu.customId
        );
        await selectMenu.deferUpdate();
        return;
    }
    (
        new (
            await import(`${__dirname}/${selectMenu.customId}`)
        ).default() as InteractionHandler
    ).execute(selectMenu);
};
