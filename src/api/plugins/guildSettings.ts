import type Hapi from '@hapi/hapi';
import { Prisma } from '@prisma/client';

const guildSettingsPlugin = {
    name: 'app/guildSettings',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route([
            {
                method: 'GET',
                path: '/guildSettings/{guildId}',
                handler: guildSettingsById,
            },
        ]);
    },
};

export default guildSettingsPlugin;

const guildSettingsById = async (
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
) => {
    const { prisma } = request.server.app;
    const guildId = request.params.guildId;
    try {
        const guildSettings = await prisma.guildSettings.findUnique({
            where: { id: guildId },
        });
        return h.response(guildSettings).code(200);
    } catch (error) {
        return h.response(error).code(500);
    }
};
