import type { ButtonInteraction } from 'discord.js';
import Base from './Base.js';

export default abstract class InteractionHandler extends Base {
    constructor() {
        super();
    }

    public abstract execute(
        button: ButtonInteraction
    ): Promise<unknown> | unknown;
}
