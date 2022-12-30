import type {
    ButtonInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import Base from './Base';

export default abstract class InteractionHandler extends Base {
    constructor() {
        super();
    }

    public abstract execute(
        button: ButtonInteraction | unknown
    ): Promise<unknown> | unknown;
    public abstract execute(
        selectMenu: StringSelectMenuInteraction | unknown
    ): Promise<unknown> | unknown;
}
