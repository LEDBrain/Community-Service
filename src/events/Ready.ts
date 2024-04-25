import Event from '../base/Event.js';
export default class Ready extends Event {
    constructor() {
        super({ name: 'ready', once: true });
    }
    public async execute() {
        console.log('Ready!');
        (await import('../deploy')).default();
    }
}
