import type Hapi from '@hapi/hapi';
import type { Guild } from 'discord.js';
import Joi from 'joi';

const userGuildsPlugin = {
    name: 'app/userGuilds',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/userGuilds/{userId}',
            handler: userGuilds,
            options: {
                validate: {
                    params: Joi.object({
                        userId: Joi.string()
                            .required()
                            .regex(/^[0-9]{18}$/),
                    }),
                    query: Joi.object({
                        force: Joi.boolean(),
                    }),
                },
            },
        });
    },
};

export default userGuildsPlugin;

const userGuilds = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { userId: user } = req.params;
    const force = req.query?.force ?? false;
    try {
        const guilds = [] as Guild[];
        for await (const guild of global.client.guilds.cache.values()) {
            if (await guild.members.fetch({ user, force })) {
                guilds.push(guild);
            }
        }
        return h.response(guilds).code(200);
    } catch (error) {
        return h.response(error.message).code(500);
    }
};
