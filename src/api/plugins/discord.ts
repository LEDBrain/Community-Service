import type Hapi from '@hapi/hapi';
import type { DiscordToken } from '@prisma/client';
import type {
    APIApplicationRoleConnection,
    RESTGetAPIOAuth2CurrentAuthorizationResult,
    RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { env } from '../../env';
import crypto from 'crypto';

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        discord: {
            getOAuthUrl(): { state: string; url: string };
            getOAuthTokens(
                code: string
            ): Promise<RESTPostOAuth2AccessTokenResult>;
            getAccessToken(
                userId: string,
                tokens: DiscordToken
            ): Promise<string>;
            getUserData(
                tokens: RESTPostOAuth2AccessTokenResult
            ): Promise<RESTGetAPIOAuth2CurrentAuthorizationResult>;
            pushMetadata(
                userId: string,
                tokens: DiscordToken,
                metadata: any
            ): Promise<void>;
            getMetadata(
                userId: string,
                tokens: DiscordToken
            ): Promise<APIApplicationRoleConnection>;
        };
    }
}

const discordPlugin: Hapi.Plugin<null> = {
    name: 'discord',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        const { prisma } = server.app;
        server.app.discord = {
            /**
             * The following methods all facilitate OAuth2 communication with Discord.
             * See https://discord.com/developers/docs/topics/oauth2 for more details.
             */

            /**
             * Generate the url which the user will be directed to in order to approve the
             * bot, and see the list of requested scopes.
             */
            getOAuthUrl() {
                const state = crypto.randomUUID();

                const url = new URL('https://discord.com/api/oauth2/authorize');
                url.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
                url.searchParams.set('redirect_uri', env.DISCORD_REDIRECT_URI);
                url.searchParams.set('response_type', 'code');
                url.searchParams.set('state', state);
                url.searchParams.set(
                    'scope',
                    'role_connections.write identify'
                );
                url.searchParams.set('prompt', 'consent');
                return { state, url: url.toString() };
            },
            /**
             * Given an OAuth2 code from the scope approval page, make a request to Discord's
             * OAuth2 service to retrieve an access token, refresh token, and expiration.
             */
            async getOAuthTokens(code) {
                const url = 'https://discord.com/api/v10/oauth2/token';
                const body = new URLSearchParams({
                    client_id: env.DISCORD_CLIENT_ID,
                    client_secret: env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: env.DISCORD_REDIRECT_URI,
                });

                const response = await fetch(url, {
                    body,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    return data;
                } else {
                    throw new Error(
                        `Error fetching OAuth tokens: [${response.status}] ${response.statusText}`
                    );
                }
            },
            /**
             * The initial token request comes with both an access token and a refresh
             * token.  Check if the access token has expired, and if it has, use the
             * refresh token to acquire a new, fresh access token.
             */
            async getAccessToken(userId, tokens) {
                if (Date.now() > tokens.expires_at) {
                    const url = 'https://discord.com/api/v10/oauth2/token';
                    const body = new URLSearchParams({
                        client_id: env.DISCORD_CLIENT_ID,
                        client_secret: env.DISCORD_CLIENT_SECRET,
                        grant_type: 'refresh_token',
                        refresh_token: tokens.refresh_token,
                    });
                    const response = await fetch(url, {
                        body,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    });
                    if (response.ok) {
                        const tokens = await response.json();
                        tokens.expires_at =
                            Date.now() + tokens.expires_in * 1000;
                        await prisma.discordToken.create({
                            data: {
                                userId,
                                ...tokens,
                            },
                        });
                        return tokens.access_token;
                    } else {
                        throw new Error(
                            `Error refreshing access token: [${response.status}] ${response.statusText}`
                        );
                    }
                }
                return tokens.access_token;
            },
            /**
             * Given a user based access token, fetch profile information for the current user.
             */
            async getUserData(tokens) {
                const url = 'https://discord.com/api/v10/oauth2/@me';
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    return data;
                } else {
                    throw new Error(
                        `Error fetching user data: [${response.status}] ${response.statusText}`
                    );
                }
            },
            /**
             * Given metadata that matches the schema, push that data to Discord on behalf
             * of the current user.
             */
            // returns APIApplicationRoleConnection
            async pushMetadata(userId, tokens, metadata) {
                // PUT /users/@me/applications/:id/role-connection
                const url = `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_CLIENT_ID}/role-connection`;
                const accessToken = await this.getAccessToken(userId, tokens);
                const body = {
                    platform_name: 'Example Linked Role Discord Bot',
                    metadata,
                };
                const response = await fetch(url, {
                    method: 'PUT',
                    body: JSON.stringify(body),
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(
                        `Error pushing discord metadata: [${response.status}] ${response.statusText}`
                    );
                }
            },
            /**
             * Fetch the metadata currently pushed to Discord for the currently logged
             * in user, for this specific bot.
             */
            async getMetadata(userId: string, tokens: DiscordToken) {
                // GET /users/@me/applications/:id/role-connection
                const url = `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_CLIENT_ID}/role-connection`;
                const accessToken = await this.getAccessToken(userId, tokens);
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    return data;
                } else {
                    throw new Error(
                        `Error getting discord metadata: [${response.status}] ${response.statusText}`
                    );
                }
            },
        };
    },
};

export default discordPlugin;
