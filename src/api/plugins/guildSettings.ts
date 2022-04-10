import type Hapi from '@hapi/hapi';

const guildSettingsPlugin = {
    name: 'app/guildSettings',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/guildSettings/{guildId}',
            handler: guildSettingsById,
        });
        server.route({
            method: ['POST', 'OPTIONS'],
            path: '/guildSettings/{guildId}',
            handler: updateGuildSettings,
        });
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
        if (!guildSettings) return h.response().code(404);
        return h.response(guildSettings).code(200);
    } catch (error) {
        return h.response(error).code(500);
    }
};

const updateGuildSettings = async (
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
) => {
    if (Object.keys(request.payload).length === 0)
        return h.response().code(204);
    // TODO: do validation?
    const { prisma } = request.server.app;
    const guildId = request.params.guildId;
    try {
        const updatedGuildSettings = await prisma.guildSettings.upsert({
            where: { id: guildId },
            update: {
                ...(request.payload as Record<string, unknown>),
            },
            create: {
                id: guildId,
                ...(request.payload as Record<string, unknown>),
            },
        });
        return h.response(updatedGuildSettings).code(200);
    } catch (error) {
        return h.response().code(400);
    }
};
