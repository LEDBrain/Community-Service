import type Hapi from '@hapi/hapi';
import type { GuildMember } from 'discord.js';
import Joi from 'joi';
import { client } from '../../index.js';

const botAppearancePlugin = {
    name: 'app/botAppearance',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/botAppearance/{guildId}',
            handler: botAppearanceByGuildId,
            options: {
                validate: {
                    params: Joi.object({
                        guildId: Joi.string()
                            .required()
                            .regex(/^[0-9]{18,19}$/),
                    }),
                },
            },
        });
    },
};

export default botAppearancePlugin;

const botAppearanceByGuildId = async (
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
) => {
    const guildId = request.params.guildId;
    try {
        const guild = await client.guilds.fetch(guildId);
        return h
            .response({
                nickname: (guild.members.me as GuildMember).displayName,
                color: (guild.members.me as GuildMember).displayColor,
            })
            .code(200);
    } catch (err) {
        return h
            .response({
                statusCode: 404,
                error: 'Guild Not Found',
                message: 'The requested guild was not found.',
            })
            .code(404);
    }
};
