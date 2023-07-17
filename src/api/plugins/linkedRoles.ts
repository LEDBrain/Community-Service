import type Hapi from '@hapi/hapi';
import Joi from 'joi';

const linkedRolesPlugin = {
    name: 'app/linkedRoles',
    dependencies: ['prisma', 'discord'],
    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/linked-role',
            handler: linkedRoleHandler,
        });
        server.route({
            method: 'GET',
            path: '/discord-oauth-callback',
            handler: discordAuthCallbackHandler,
            options: {
                validate: {
                    query: Joi.object({
                        code: Joi.string().required(),
                        state: Joi.string().required(),
                    }),
                },
            },
        });
    },
};

export default linkedRolesPlugin;

const linkedRoleHandler = async (
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
) => {
    const { getOAuthUrl } = request.server.app.discord;
    const { url, state } = getOAuthUrl();
    console.log(url, state);

    // Store the signed state param in the user's cookies so we can verify
    // the value later. See:
    // https://discord.com/developers/docs/topics/oauth2#state-and-security
    //h.state('clientState', state);

    // Send the user to the Discord owned OAuth2 authorization endpoint
    h.unstate('clientState');
    h.state('clientState', state);
    return h.redirect(url);
};

const discordAuthCallbackHandler = async (
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
) => {
    try {
        const { getOAuthTokens, getUserData } = request.server.app.discord;
        const { prisma } = request.server.app;

        // 1. Uses the code and state to acquire Discord OAuth2 tokens
        const code = request.query['code'];
        const discordState = request.query['state'];

        // make sure the state parameter exists
        // const { clientState } = request.signedCookies;
        // console.log(request.payload, request.pre);
        const { clientState } = request.state;
        console.log(clientState, discordState);
        if (clientState !== discordState) {
            console.error('State verification failed.');
            return h.response('State verification failed.').code(403);
        }

        const tokens = await getOAuthTokens(code);

        // 2. Uses the Discord Access Token to fetch the user profile
        const meData = await getUserData(tokens);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const userId = meData.user!.id; // we know, that the user has to exists due to using the identity scope!
        await prisma.discordToken.create({
            data: {
                userId,

                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: Date.now() + tokens.expires_in * 1000,
            },
        });

        // 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
        await updateMetadata(userId, request.server);

        return h.response('You did it! Now go back to Discord.');
    } catch (e) {
        console.error(e);
        return h.response().code(500);
    }
};

/**
 * Given a Discord UserId, push static make-believe data to the Discord
 * metadata endpoint.
 */
async function updateMetadata(userId: string, server: Hapi.Server) {
    const { prisma, discord } = server.app;
    // Fetch the Discord tokens from storage
    const tokens = await prisma.discordToken.findFirstOrThrow({
        where: { userId },
    });

    let metadata = {};
    try {
        // Fetch the new metadata you want to use from an external source.
        // This data could be POST-ed to this endpoint, but every service
        // is going to be different.  To keep the example simple, we'll
        // just generate some random data.
        const gameAccounts = await prisma.gameAccount.findMany({
            where: {
                discordUserId: userId,
            },
        });

        metadata = {
            game_de: gameAccounts.find(account => account.game === 'de_DE')
                ? 1
                : 0,
        };
    } catch (e: any) {
        e.message = `Error fetching external data: ${e.message}`;
        console.error(e);
        // If fetching the profile data for the external service fails for any reason,
        // ensure metadata on the Discord side is nulled out. This prevents cases
        // where the user revokes an external app permissions, and is left with
        // stale linked role data.
    }

    // Push the data to Discord.
    await discord.pushMetadata(userId, tokens, metadata);
}