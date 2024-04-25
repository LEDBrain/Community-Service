import { expect } from '@hapi/code';
import type { Server } from '@hapi/hapi';
import Lab from '@hapi/lab';
import { init } from '../test-utils/server.js';
const { afterEach, beforeEach, describe, it, experiment } = Lab.script();
export const lab = Lab.script();

experiment('Guild Settings Tests', () => {
    describe('GET /guildSettings/${id} with no ID', () => {
        let server: Server;

        beforeEach(async () => {
            server = await init();
        });

        afterEach(async () => {
            await server.stop();
        });

        it('responds with 404', async () => {
            const res = await server.inject({
                method: 'get',
                url: '/guildSettings/0',
            });
            expect(res.statusCode).to.equal(404);
        });
    });
});
