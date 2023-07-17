import Hapi from '@hapi/hapi';
import type { PrismaClient } from '@prisma/client';
import { env } from '../env';
import fs from 'fs/promises';
import path from 'path';

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient;
    }
}

const getPlugins = async (): Promise<Hapi.Plugin<unknown>[]> => {
    const plugins: Hapi.Plugin<unknown>[] = [];
    const files = await fs.readdir(path.join(__dirname, `/plugins`));
    for await (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
            const plugin = (
                await import(path.join(__dirname, `/plugins/${file}`))
            ).default;
            plugins.push(plugin);
        }
    }
    console.log(plugins);
    return plugins;
};

const server: Hapi.Server = Hapi.server({
    port: env.PORT || 3000,
    host: env.HOST || 'localhost',
});

server.state('clientState', {
    path: '/',
    isSecure: false,
    clearInvalid: true,
    strictHeader: true,
    isSameSite: 'Lax',
    ttl: 1000 * 60 * 5,
});

export async function start(): Promise<Hapi.Server> {
    const plugins = await getPlugins();
    await server.register(plugins);
    await server.start();
    return server;
}

process.on('unhandledRejection', async err => {
    await server.app.prisma.$disconnect();
    console.log(err);
    process.exit(1);
});

start()
    .then(server => {
        console.log(`
🚀 Server ready at: ${server.info.uri}
⭐️ See sample requests: http://pris.ly/e/ts/rest-hapi#3-using-the-rest-api
`);
    })
    .catch(err => {
        console.log(err);
    });
