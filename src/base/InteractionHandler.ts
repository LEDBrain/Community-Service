import type { ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import Base from './Base';

export default abstract class InteractionHandler extends Base {
    constructor() {
        super();
    }

    public abstract execute(
        button: ButtonInteraction | unknown
    ): Promise<unknown> | unknown;
    public abstract execute(
        selectMenu: SelectMenuInteraction | unknown
    ): Promise<unknown> | unknown;
}
